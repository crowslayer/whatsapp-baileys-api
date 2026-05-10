import mongoose from 'mongoose';

import { ILogger } from '@infrastructure/loggers/Logger';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

import { IMongooseConfig } from '@config/index';

export class MongoDBConnection {
  private _isConnected: boolean = false;

  constructor(
    private readonly _config: IMongooseConfig,
    private readonly _logger: ILogger
  ) {}

  async connect(): Promise<void> {
    if (this._isConnected) {
      this._logger.info('MongoDB already connected');
      return;
    }
    try {
      if (!this._config.enabled) {
        throw new Error('Database not enabled');
      }
      await mongoose.connect(this._config.uri);
      this._isConnected = true;
      this._logger.info('MongoDB connected succesfully');
      this.setupEventHandlers();
    } catch (error) {
      this._logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this._isConnected) {
      return;
    }
    try {
      await mongoose.disconnect();
      this._isConnected = false;
      this._logger.info('MongoDB disconnected');
    } catch (error) {
      this._logger.error('Error disconnecting MongpDB');
      throw new InfrastructureError('Error disconnecting MongpDB', error);
    }
  }

  getConnection(): typeof mongoose {
    return mongoose;
  }

  isHealthy(): boolean {
    return this._isConnected && mongoose.connection.readyState === 1;
  }

  private setupEventHandlers(): void {
    mongoose.connection.on('error', (error) => {
      this._logger.error('MongoDB connection error: ', error);
    });
    mongoose.connection.on('disconnected', () => {
      this._isConnected = false;
      this._logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      this._isConnected = true;
      this._logger.info('MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      await this.disconnect();
      this._logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  }
}
