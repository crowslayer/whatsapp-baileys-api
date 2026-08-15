// src/infrastructure/http/ExpressApp.ts
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { ContainerBuilder } from 'node-dependency-injection';

import { createAuthMiddleware } from '@infrastructure/http/middlewares/AuthMiddleware';
import { createCorsMiddleware } from '@infrastructure/http/middlewares/CorsMiddleware';
import { errorMiddleware } from '@infrastructure/http/middlewares/ErrorMiddleware';
import { loggerMiddleware } from '@infrastructure/http/middlewares/LoggerMiddleware';
import { requestIdMiddleware } from '@infrastructure/http/middlewares/RequestIdMiddleware';
import { createCampaignRouter } from '@infrastructure/http/routes/campaign.routes';
import { createChatsRouter } from '@infrastructure/http/routes/chats.routes';
import { createFlowsRouter } from '@infrastructure/http/routes/flows.routes';
import { createGroupRouter } from '@infrastructure/http/routes/group.routes';
import { createInstanceRouter } from '@infrastructure/http/routes/instance.routes';
import { createMessageRouter } from '@infrastructure/http/routes/message.routes';
import { createMultimediaRouter } from '@infrastructure/http/routes/multimedia.routes';
import { ITokenVerifier } from '@infrastructure/http/validators/token/Index';
import { ILogger } from '@infrastructure/loggers/Logger';

import { IConfig } from '@config/index';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

export class ExpressApp {
  private _app: express.Application;
  private _config: IConfig;
  logger: ILogger;

  constructor(
    config: IConfig,
    logger: ILogger,
    readonly container: ContainerBuilder
  ) {
    this._config = config;
    this.logger = logger;

    this._app = express();
    this.initialize();
  }

  initialize(): void {
    const isProd = this._config.environment === 'production';
    this.initMiddlewares();

    if (!isProd) {
      const filename = fileURLToPath(import.meta.url);
      const pathViews = dirname(filename);
      this._app.set('view engine', 'ejs');
      this._app.set('views', path.join(pathViews, '../views'));
    }

    this.initRoutes();
    this.errorMiddleware();
  }

  private initMiddlewares(): void {
    this._app.use(requestIdMiddleware());
    this.initHelmet();
    this.initCors();
    this._app.use(express.json({ limit: '1mb' }));
    this._app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    this._app.set('trust proxy', 1); // agregar config.http.trustproxy
    this.initRateLimit(this._config.security?.enabledRateLimit ?? false);
    this.initLogger();
  }

  private errorMiddleware(): void {
    this._app.use(errorMiddleware(this.logger));
  }
  private initHelmet(): void {
    this._app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'none'"],
            scriptSrc: ["'none'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000, // 1 año
          includeSubDomains: true,
          preload: true,
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // API pública
        dnsPrefetchControl: { allow: false },
      })
    );
    this._app.disable('x-powered-by');
  }
  private initCors(): void {
    this._app.use(createCorsMiddleware(this._config, this.logger));
  }

  private initRateLimit(enabledRateLimit: boolean): void {
    if (enabledRateLimit) {
      const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many requests, please try again later' },
      });
      this._app.use('/api/', globalLimiter);
    }
  }

  private initLogger(): void {
    this._app.use(loggerMiddleware(this.logger));
  }

  private initRoutes(): void {
    this._app.get('/health', (_req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
    const config = this._config;
    const base = `/${config.api.path}/${config.api.version}`;

    // Auth
    if (config.security?.protectRoutes) {
      const tokenVerifier = this.container.get<ITokenVerifier>(
        'infrastructure.http.token_verifier'
      );
      this._app.use(`${base}`, createAuthMiddleware(tokenVerifier));
    }

    // Routes
    this._app.use(`${base}/instances`, createInstanceRouter(this.container));
    this._app.use(`${base}/instances`, createGroupRouter(this.container));
    this._app.use(`${base}/instances`, createChatsRouter(this.container));
    this._app.use(`${base}/campaigns`, createCampaignRouter(this.container));
    this._app.use(`${base}/messages`, createMessageRouter(this.container));
    this._app.use(`${base}/flows`, createFlowsRouter(this.container));
    this._app.use(
      `${base}/multimedia`,
      express.json({ limit: '50mb' }), // límite alto solo donde se necesita
      createMultimediaRouter(this.container)
    );
  }

  static create(config: IConfig, logger: ILogger, container: ContainerBuilder): Application {
    const server = new ExpressApp(config, logger, container);
    return server.application;
  }

  get application(): Application {
    return this._app;
  }
}
