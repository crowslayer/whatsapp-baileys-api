import mongoose from 'mongoose';
import { config } from '@config/env';

import { Logger } from '@infrastructure/Logger/Logger';
import { DatabaseConfigurationError } from '@shared/infrastructure/Error/DatabaseConfigurationError';


export const connectDatabase = async (logger:Logger): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info(' MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw new DatabaseConfigurationError(error)
    process.exit(1);
  }
};