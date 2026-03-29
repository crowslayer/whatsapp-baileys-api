import { ILogger } from '@infrastructure/loggers/Logger';
import { IDatabaseConnection } from '@infrastructure/persistence';
import { MongoDBConnection } from '@infrastructure/persistence/mongo/MongoDBConnection';

import { IConfig } from '@config/index';

export class DatabaseConnectionFactory {
  static create(config: IConfig, logger: ILogger): IDatabaseConnection {
    const db = config.database;
    if (!db) {
      throw new Error('Database config not found');
    }
    switch (db.type) {
      case 'mongoose':
        return new MongoDBConnection(db, logger);

      case 'typeorm':
        throw new Error('TypeORM not implemented yet');

      case 'sequelize':
        throw new Error('Sequelize not implemented yet');

      default:
        throw new Error(`Unsupported database type: ${db}`);
    }
  }
}
