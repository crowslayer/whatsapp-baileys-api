import { randomUUID } from 'crypto';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { ContainerBuilder } from 'node-dependency-injection';

import { ILogger } from '@infrastructure/loggers/Logger';

import { IConfig } from '@config/index';

import { createCorsMiddleware } from './middlewares/CorsMiddleware';
import { errorMiddleware } from './middlewares/ErrorMiddleware';
import { loggerMiddleware } from './middlewares/LoggerMiddleware';
import { createGroupRouter } from './routes/group.routes';
import { createInstanceRouter } from './routes/instance.routes';
import { createMessageRouter } from './routes/message.routes';
import { createMultimediaRouter } from './routes/multimedia.routes';

export const createApp = (
  config: IConfig,
  logger: ILogger,
  container: ContainerBuilder
): Application => {
  const app = express();
  const isProd = config.environment === 'production';

  // ── Request ID (primero en el pipeline) ───────────────────────────────────
  app.use((req, res, next) => {
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(
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
    })
  );

  app.use(createCorsMiddleware(config, logger));
  // Middleware global
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  // ── Rate limiting ─────────────────────────────────────────────────────────
  if (config.security?.enabledRateLimit) {
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later' },
    });
    app.use('/api/', globalLimiter);
  }

  const loggerMiddlewareHandler = loggerMiddleware(logger);
  app.use(loggerMiddlewareHandler);

  if (isProd) {
    const filename = fileURLToPath(import.meta.url);
    const pathViews = dirname(filename);

    // views temporal
    app.set('view engine', 'ejs');
    app.set('views', path.join(pathViews, '../Views'));
  }

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const base = `/${config.api.path}/${config.api.version}`;
  // Routes
  app.use('/api/v1/instances', createInstanceRouter(container));
  app.use('/api/v1/messages', createMessageRouter(container));
  app.use(
    `${base}/multimedia`,
    express.json({ limit: '50mb' }), // límite alto solo donde se necesita
    createMultimediaRouter(container)
  );
  app.use('/api/v1/groups', createGroupRouter(container));

  // Error handling
  const errorHandler = errorMiddleware(logger);
  app.use(errorHandler);

  return app;
};
