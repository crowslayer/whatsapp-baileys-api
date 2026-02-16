import { ILogger } from '@infrastructure/loggers/Logger';

import { IConfig } from '@config/index';

import { MongoDBConnection } from './mongo/MongoDBConnection';

import { IDatabaseConnection } from './index';
// import { TypeORMConnection } from './typeorm/TypeORMConnection';
// import { SequelizeConnection } from './sequelize/SequelizeConnection';

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
