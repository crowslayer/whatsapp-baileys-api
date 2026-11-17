import mongoose from 'mongoose';

import { IMongooseConfig } from '@apps/backend/config';

import { ErrorCode } from '@shared/domain/error/ErrorCode';
import { ILogger } from '@shared/domain/Logger';
import { DatabaseConnectionError } from '@shared/infrastructure/persistence/error/DatabaseConnectionError';
import { MongoInfrastructureError } from '@shared/infrastructure/persistence/mongo/MongoInfrastructureError';

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

    if (!this._config.enabled) {
      throw new DatabaseConnectionError('Database not enabled');
    }

    try {
      await mongoose.connect(this._config.uri, this._config.options);

      this._isConnected = true;

      this._logger.info('MongoDB connected succesfully');

      this.setupEventHandlers();
    } catch (error) {
      this._logger.error('Failed to connect to MongoDB', error);
      throw new MongoInfrastructureError(
        'Failed to connect to MongoDB',
        ErrorCode.DB_CONNECTION_FAILED,
        { error }
      );
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
      throw new MongoInfrastructureError(
        'Error disconnecting MongpDB',
        ErrorCode.DB_CONNECTION_FAILED,
        { error }
      );
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
  }
}
