// src/infrastructure/http/ExpressApp.ts
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { ContainerBuilder } from 'node-dependency-injection';

import { AuthMiddleware } from '@infrastructure/http/middlewares/AuthMiddleware';
import { BackpressureMiddleware } from '@infrastructure/http/middlewares/BackpressureMiddleware';
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

import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { IConfig } from '@config/index';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

export class ExpressApp {
  private _app: express.Application;
  private _config: IConfig;
  private _logger: ILogger;

  constructor(
    config: IConfig,
    logger: ILogger,
    readonly container: ContainerBuilder
  ) {
    this._config = config;
    this._logger = logger;

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
    this._app.set('trust proxy', 1); // agregar config.http.trustproxy
    this._app.use(requestIdMiddleware());
    this.initHelmet();
    this.initCors();
    this._app.use(express.json({ limit: '1mb' }));
    this._app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    this.initRateLimit(this._config.security?.enabledRateLimit ?? false);
    this.initBackpressureMiddleware();
    this.initLogger();
    this.registerAuthMiddleware();
  }

  private errorMiddleware(): void {
    this._app.use(errorMiddleware(this._logger));
  }
  private initHelmet(): void {
    this._app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'none'"],
            scriptSrc: ["'none'"],
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'none'"],
            formAction: ["'none'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        hsts: {
          maxAge: 31536000, // 1 año
          includeSubDomains: true,
          preload: true,
        },
        referrerPolicy: { policy: 'no-referrer' },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'cross-origin' }, // API pública
        xContentTypeOptions: true,
        xDnsPrefetchControl: { allow: false },
      })
    );
    this._app.disable('x-powered-by');
  }
  private initCors(): void {
    this._app.use(createCorsMiddleware(this._config, this._logger));
  }

  private initRateLimit(enabledRateLimit: boolean): void {
    if (!enabledRateLimit) {
      return;
    }

    const apiPrefix = `/${this._config.api.path}/`.replace(/\/+/g, '/');

    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later' },
    });

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: {
        error: 'Too many authentication attempts',
      },
    });

    this._app.use(apiPrefix, globalLimiter);

    this._app.use(`${apiPrefix}/auth/login`, authLimiter);

    this._app.use(`${apiPrefix}/auth/refresh`, authLimiter);
  }

  private initBackpressureMiddleware(): void {
    this._app.use(BackpressureMiddleware.concurrencyLimiter());
  }

  private initLogger(): void {
    this._app.use(loggerMiddleware(this._logger));
  }

  private registerAuthMiddleware(): void {
    if (this._config.security?.protectRoutes) {
      const tokenVerifier = this.container.get<ITokenVerifier>(
        'infrastructure.http.token_verifier'
      );
      const apiPrefix = `/${this._config.api.path}/${this._config.api.version}`.replace(
        /\/+/g,
        '/'
      );
      this._app.use(
        AuthMiddleware.authenticate(tokenVerifier, [
          { method: 'GET', path: '/health' },
          { method: 'POST', path: `${apiPrefix}/auth/login` },
          { method: 'POST', path: `${apiPrefix}/auth/refresh` },
          { method: 'POST', path: `${apiPrefix}/auth/logout` },
        ])
      );
    }
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
    const base = `/${config.api.path}/${config.api.version}`.replace(/\/+/g, '/');

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

    this._app.use((req, _res, next) => {
      next(new NotFoundError(`Route ${req.method} not found`));
    });
  }

  static create(config: IConfig, logger: ILogger, container: ContainerBuilder): Application {
    const server = new ExpressApp(config, logger, container);
    return server.application;
  }

  get application(): Application {
    return this._app;
  }
}
