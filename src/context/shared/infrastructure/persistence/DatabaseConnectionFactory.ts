import { IConfig } from '@apps/backend/config';

import { ILogger } from '@shared/domain/Logger';
import { DatabaseConfigurationError } from '@shared/infrastructure/persistence/error/DatabaseConfigurationError';
import { IDatabaseConnection } from '@shared/infrastructure/persistence/IDatabaseConnection';
import { MongoDBConnection } from '@shared/infrastructure/persistence/mongo/MongoDBConnection';

export class DatabaseConnectionFactory {
  static create(config: IConfig, logger: ILogger): IDatabaseConnection {
    const db = config.database;
    if (!db) {
      throw new DatabaseConfigurationError('Database config not found');
    }
    switch (db.type) {
      case 'mongoose':
        return new MongoDBConnection(db, logger);

      case 'typeorm':
        throw new DatabaseConfigurationError('TypeORM not implemented yet');

      case 'sequelize':
        throw new DatabaseConfigurationError('Sequelize not implemented yet');

      default:
        throw new DatabaseConfigurationError(`Unsupported database type: ${db}`);
    }
  }
}
