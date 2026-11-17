import http from 'http';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
dotenv.config();

import { getContainer } from '@apps/backend/dependency-injection';
import { ExpressApp } from '@apps/backend/http/ExpressApp';
import { SocketGateway } from '@apps/backend/realtime/SocketGateway';

import { IEventBus } from '@shared/domain/event/IEventBus';
import { ILogger } from '@shared/domain/Logger';
import { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';
import { EventSubscribers } from '@shared/infrastructure/event-bus/EventSubscribers';
import { IDatabaseConnection } from '@shared/infrastructure/persistence/IDatabaseConnection';

import { IConfig } from './config';
// eslint-disable-next-line
async function bootstrap(): Promise<void> {
  try {
    // container-builder
    const _filename = fileURLToPath(import.meta.url);
    const rootPath = resolve(join(dirname(_filename), '../../'));

    const container = await getContainer({
      configDir: 'apps/backend/dependency-injection/services',
      rootPath,
    });
    const config = container.get<IConfig>('api.config');
    const logger = container.get<ILogger>('shared.logger');

    const mongoConnection = container.get<IDatabaseConnection>(
      'infrastructure.database.connection'
    );

    const connectionManager = container.get<IRuntimeManager>('application.runtime.runtime_manager');

    // DoaminEvents register subscribers
    const domainEventBus = container.get<IEventBus>('shared.domain.event_bus');
    const subscribers = EventSubscribers.from(container);
    domainEventBus.addSubscribers(subscribers);

    await mongoConnection.connect();

    // Restore existing connections
    await connectionManager.restoreAll();

    // Create Express app
    const app = ExpressApp.create(config, logger, container);

    // =============================================
    //  Server win Socket
    // =============================================

    const server = http.createServer(app);
    server.headersTimeout = 10000;
    server.requestTimeout = 10000;
    server.keepAliveTimeout = 5000;
    server.maxHeadersCount = 100;

    const socketGateway = new SocketGateway(
      server,
      container.get('shared.event_bus'), // NodeEventBus
      container.get('realtime.socket_authenticator'),
      logger,
      config.security?.cors.origins as string[]
    );

    socketGateway.init();

    server.listen(config.api.port, () => {
      logger.info('Server + WebSocket running');
      logger.info('Whatsapp api-rest baileys');
      logger.info(`Version: ${config.api.version}`);
      logger.info(`Environment: ${config.environment}`);
      logger.info(`Port: ${config.api.port}`);
      logger.info(
        `API: http://localhost:${config.api.port}/${config.api.path}/${config.api.version}`
      );
    });
    // =============================================
    //  Server with Socket
    // =============================================

    // =============================================
    //  Server
    // =============================================
    // Start server
    // const server = app.listen(config.api.port, () => {
    //   logger.info('Whatsapp api-rest baileys');
    //   logger.info(`Version: ${config.api.version}`);
    //   logger.info(`Environment: ${config.environment}`);
    //   logger.info(`Port: ${config.api.port}`);
    //   logger.info(
    //     `API: http://localhost:${config.api.port}/${config.api.path}/${config.api.version}`
    //   );
    // });
    // =============================================
    //  Server
    // =============================================

    // Graceful shutdown
    const gracefulShutdown = async (): Promise<void> => {
      if (!server) return;
      logger.info('Shutting down gracefully...');
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });

      await mongoConnection.disconnect();
      socketGateway.close();
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    process.on('uncaughtException', (err) => {
      logger.fatal(err);
      process.exit(1);
    });

    process.on('unhandledRejection', (err) => {
      logger.fatal(err as Error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
