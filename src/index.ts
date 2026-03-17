import dotenv from 'dotenv';

dotenv.config();
import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';
import { getContainer } from '@infrastructure/container/Container';
import { ExpressApp } from '@infrastructure/http/ExpressApp';
import { ILogger } from '@infrastructure/loggers/Logger';
import { IDatabaseConnection } from '@infrastructure/persistence';

import { IConfig } from './config';

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    const container = await getContainer();
    const config = container.get<IConfig>('api.config');
    const logger = container.get<ILogger>('shared.logger');

    const mongoConnection = container.get<IDatabaseConnection>(
      'infrastructure.database.connection'
    );
    const connectionManager = container.get<BaileysConnectionManager>(
      'infrastructure.baileys.connection_manager'
    );

    await mongoConnection.connect();

    // Restore existing connections
    await connectionManager.restoreConnections();

    // Create Express app
    const app = ExpressApp.create(config, logger, container);

    // Start server
    const server = app.listen(config.api.port, () => {
      logger.info('Whatsapp api-rest baileys');
      logger.info(`Version: ${config.api.version}`);
      logger.info(`Environment: ${config.environment}`);
      logger.info(`Port: ${config.api.port}`);
      logger.info(
        `API: http://localhost:${config.api.port}/${config.api.path}/${config.api.version}`
      );
    });

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
      // server.close(() => {
      //   logger.info('HTTP server closed');
      // });

      // Disconnect all WhatsApp instances
      const connections = connectionManager.getAllConnections();
      for (const [instanceId, adapter] of connections) {
        try {
          adapter.disconnect();
          logger.info(`Disconnected instance: ${instanceId}`);
        } catch (error) {
          logger.error(`Error disconnecting instance ${instanceId}:`, error);
        }
      }

      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
