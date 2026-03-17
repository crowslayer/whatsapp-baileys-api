import cors, { CorsOptions } from 'cors';
import { RequestHandler } from 'express';

import { ILogger } from '@infrastructure/loggers/Logger';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

import { IConfig } from '@config/index';

export function createCorsMiddleware(config: IConfig, logger: ILogger): RequestHandler {
  if (!config.security?.cors?.origins?.length) {
    throw new Error('CORS origins not configured');
  }

  const { origins } = config.security.cors;
  const isProd = config.environment === 'production';

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        if (isProd) return callback(new UnauthorizedError('Origin header is required'));
        return callback(null, true);
      }

      if (origins.includes(origin)) return callback(null, true);

      logger.warn('CORS blocked request', {
        origin,
        allowedOrigins: origins,
        environment: config.environment,
      });
      return callback(new UnauthorizedError('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: isProd ? 1800 : 300,
    credentials: true,
  };

  return cors(corsOptions);
}
