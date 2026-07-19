import { required, toBoolean, toNumber } from '@config/builders/Utils';
import { IDatabaseConfig } from '@config/index';

export class DatabaseConfigBuilder {
  static build(): IDatabaseConfig {
    const DB_TYPE = required('DB_TYPE', process.env.DB_TYPE);

    switch (DB_TYPE) {
      case 'mongoose':
        return {
          type: 'mongoose',
          enabled: toBoolean(process.env.DB_ENABLED),
          uri: required('DB_URI', process.env.DB_URI),
        };

      case 'typeorm':
        return {
          type: 'typeorm',
          enabled: true,
          dialect: 'postgres',
          host: required('DB_HOST', process.env.DB_HOST),
          port: toNumber('DB_PORT', process.env.DB_PORT),
          username: required('DB_USER', process.env.DB_USER),
          password: required('DB_PASS', process.env.DB_PASS),
          database: required('DB_NAME', process.env.DB_NAME),
          entities: [],
        };

      case 'sequelize':
        return {
          type: 'sequelize',
          enabled: true,
          dialect: 'postgres',
          host: required('DB_HOST', process.env.DB_HOST),
          port: toNumber('DB_PORT', process.env.DB_PORT),
          username: required('DB_USER', process.env.DB_USER),
          password: required('DB_PASS', process.env.DB_PASS),
          database: required('DB_NAME', process.env.DB_NAME),
          models: [],
        };

      default:
        throw new Error(`Unsupported DB_TYPE: ${DB_TYPE}`);
    }
  }
}
