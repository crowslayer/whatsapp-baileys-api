import 'dotenv/config';
import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';
import { getContainer } from '@infrastructure/container/Container';
import { createApp } from '@infrastructure/http/App';
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
    const repository = container.get('infrastructure.repository.whatsapp_instance');

    await mongoConnection.connect();
    // await connectDatabase(logger);
    // Initialize repository and connection manager
    // const repository = new MongoWhatsAppInstanceRepository();
    // const connectionManager = new BaileysConnectionManager(repository, logger);

    // Restore existing connections
    await connectionManager.restoreConnections();

    // Create Express app
    const app = createApp(repository, connectionManager, logger);

    // Start server
    const server = app.listen(config.api.port, () => {
      // logger.info(`${config.app.name}`);
      // logger.info(`Version: ${config.app.version}`);
      logger.info(`Environment: ${config.environment}`);
      logger.info(`Port: ${config.api.port}`);
      logger.info(
        `API: http://localhost:${config.api.port}/${config.api.path}/${config.api.version}`
      );
    });

    // Graceful shutdown
    const gracefulShutdown = async (): Promise<void> => {
      logger.info('Shutting down gracefully...');

      server.close(() => {
        logger.info('HTTP server closed');
      });

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
