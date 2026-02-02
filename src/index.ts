import { config } from "@config/env.js";
import { createApp } from "@infrastructure/Http/App";
import { PinoLogger } from "@infrastructure/Logger/PinoLogger/PinoLogger";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { connectDatabase } from "@infrastructure/persistence/Mongo/Connection";
import { MongoWhatsAppInstanceRepository } from "@infrastructure/persistence/Mongo/Repositories/MongoWhatsAppInstanceRepository";


const logger = new PinoLogger();

async function bootstrap() {
  try {
    // Connect to database
    await connectDatabase(logger);

    // Initialize repository and connection manager
    const repository = new MongoWhatsAppInstanceRepository();
    const connectionManager = new BaileysConnectionManager(repository, logger);

    // Restore existing connections
    await connectionManager.restoreConnections();

    // Create Express app
    const app = createApp(repository, connectionManager, logger);

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`${config.app.name}`);
      logger.info(`Version: ${config.app.version}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Port: ${config.port}`);
      logger.info(`API: http://localhost:${config.port}/api/v1`);
                          
                
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
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
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();