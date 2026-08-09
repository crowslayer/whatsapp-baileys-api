import { ILogger } from '@infrastructure/loggers/Logger';
import { IDatabaseConnection } from '@infrastructure/persistence';
import { MongoDBConnection } from '@infrastructure/persistence/mongo/MongoDBConnection';

import { DatabaseConfigurationError } from '@shared/infrastructure/errors/DatabaseConfigurationError';
import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

import { IConfig } from '@config/index';

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
        throw new InfrastructureError(`Unsupported database type: ${db}`);
    }
  }
}
