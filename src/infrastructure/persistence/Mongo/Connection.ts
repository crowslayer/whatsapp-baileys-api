import mongoose from 'mongoose';

import { ILogger } from '@infrastructure/loggers/Logger';

import { DatabaseConfigurationError } from '@shared/infrastructure/errors/DatabaseConfigurationError';

import { config } from '@config/env';

export const connectDatabase = async (logger: ILogger): Promise<void> => {
  try {
    let uri = '';

    if (config.database?.type === 'mongoose') {
      uri = config.database.uri;
    }
    await mongoose.connect(uri);
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
    throw new DatabaseConfigurationError(error);
  }
};
