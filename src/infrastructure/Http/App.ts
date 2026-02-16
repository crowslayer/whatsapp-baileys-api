import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';
import { ILogger } from '@infrastructure/loggers/Logger';

import { errorMiddleware } from './middlewares/ErrorMiddleware';
import { loggerMiddleware } from './middlewares/LoggerMiddleware';
import { createGroupRouter } from './routes/group.routes';
import { createInstanceRouter } from './routes/instance.routes';
import { createMessageRouter } from './routes/message.routes';
import { createMultimediaRouter } from './routes/multimedia.routes';

export const createApp = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager,
  logger: ILogger
): Application => {
  const app = express();

  // Middleware global
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  const loggerMiddlewareHandler = loggerMiddleware(logger);
  app.use(loggerMiddlewareHandler);

  const filename = fileURLToPath(import.meta.url);
  const pathViews = dirname(filename);

  // views temporal
  app.set('view engine', 'ejs');
  app.set('views', path.join(pathViews, '../Views'));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Routes
  app.use('/api/v1/instances', createInstanceRouter(repository, connectionManager));
  app.use('/api/v1/messages', createMessageRouter(repository, connectionManager));
  app.use('/api/v1/multimedia', createMultimediaRouter(repository, connectionManager));
  app.use('/api/v1/groups', createGroupRouter(repository, connectionManager));

  // Error handling
  const errorHandler = errorMiddleware(logger);
  app.use(errorHandler);

  return app;
};
