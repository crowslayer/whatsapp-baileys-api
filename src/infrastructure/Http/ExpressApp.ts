// src/infrastructure/http/ExpressApp.ts
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import express, { Application, RequestHandler, Router } from 'express';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

export class ExpressApp {
  static create(
    instanceRouter: Router,
    messageRouter: Router,
    groupRouter: Router,
    multimediaRouter: Router,
    loggerMiddleware: RequestHandler,
    errorMiddleware: RequestHandler
  ): Application {
    const app = express();

    // Middleware global
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(loggerMiddleware);

    // Configurar vistas EJS
    try {
      app.set('view engine', 'ejs');
      app.set('views', join(__dirname, 'views'));
    } catch (error) {
      console.error('Error setting up views:', error);
    }

    // Health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        di: 'enabled',
      });
    });

    // API Routes
    app.use('/api/v1/instances', instanceRouter);
    app.use('/api/v1/messages', messageRouter);
    app.use('/api/v1/multimedia', multimediaRouter);
    app.use('/api/v1', groupRouter);

    // Error handling middleware (debe ser el último)
    app.use(errorMiddleware);

    return app;
  }
}
