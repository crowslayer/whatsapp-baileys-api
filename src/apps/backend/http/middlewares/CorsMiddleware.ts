import cors, { CorsOptions } from 'cors';
import { RequestHandler } from 'express';

import { IConfig } from '@apps/backend/config';

import { ILogger } from '@shared/domain/Logger';

export function createCorsMiddleware(config: IConfig, logger: ILogger): RequestHandler {
  if (!config.security?.cors?.origins?.length) {
    throw new Error('CORS origins not configured');
  }

  const { origins } = config.security.cors;

  if (!origins?.length) {
    throw new Error('CORS origins not configured');
  }

  const allowedOrigins = new Set(origins);
  const isProd = config.environment === 'production';

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, origin);
      }

      logger.warn('CORS blocked request', {
        origin,
        allowedOrigins: origins,
        environment: config.environment,
      });

      return callback(null, false);
    },

    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id', 'X-Correlation-Id'],
    maxAge: isProd ? 1800 : 300,
    credentials: false,
    optionsSuccessStatus: 204,
  };

  return cors(corsOptions);
}
