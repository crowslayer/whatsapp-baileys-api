import dotenv from 'dotenv';

import { IConfig } from '.';
dotenv.config();

function required(name: string, value?: string): string {
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

function toBoolean(value?: string): boolean {
  return value === 'true';
}

function toNumber(name: string, value?: string): number {
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`Env variable ${name} must be a number`);
  }
  return parsed;
}
type Environment = 'development' | 'production' | 'test' | 'staging';

function parseEnvironment(value?: string): Environment {
  switch (value) {
    case 'development':
    case 'production':
    case 'test':
    case 'staging':
      return value;
    default:
      throw new Error(`Invalid NODE_ENV: ${value}`);
  }
}

function buildDatabase(): IConfig['database'] {
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

// Port number
const PORT = Number(process.env.PORT) || 3333;
const ENVIRONMENT = parseEnvironment(process.env.NODE_ENV);
const API_PATH = process.env.API_PATH || 'api';
const API_VERSION = process.env.API_VERSION || 'v1';
const APP_URL = process.env.APP_URL ?? null;

function buildSecurity(): IConfig['security'] {
  const SECURITY_TYPE = required('SECURITY_TYPE', process.env.SECURITY_TYPE);

  switch (SECURITY_TYPE) {
    case 'jwt':
      return {
        type: 'jwt',
        enabled: true,
        cors: {
          origins: (process.env.ACCEPTED_ORIGINS || '').split(',').filter(Boolean),
        },
        protectRoutes: toBoolean(process.env.PROTECT_ROUTES),
        enabledRateLimit: toBoolean(process.env.ENABLED_RATE_LIMITS),
        jwt: {
          secret: required('JWT_SECRET', process.env.JWT_SECRET),
          expires: process.env.JWT_EXPIRES || '1d',
          refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
        },
      };

    case 'oauth2':
      return {
        type: 'oauth2',
        enabled: true,
        cors: {
          origins: (process.env.ACCEPTED_ORIGINS || '').split(',').filter(Boolean),
        },
        protectRoutes: toBoolean(process.env.PROTECT_ROUTES),
        enabledRateLimit: toBoolean(process.env.ENABLED_RATE_LIMITS),
        clientId: required('OAUTH_CLIENT_ID', process.env.OAUTH_CLIENT_ID),
        clientSecret: required('OAUTH_CLIENT_SECRET', process.env.OAUTH_CLIENT_SECRET),
        authorizationServer: required('OAUTH_AUTH_SERVER', process.env.OAUTH_AUTH_SERVER),
      };

    default:
      throw new Error(`Unsupported SECURITY_TYPE: ${SECURITY_TYPE}`);
  }
}

export const config: Readonly<IConfig> = Object.freeze({
  environment: ENVIRONMENT,
  api: {
    port: PORT,
    path: API_PATH,
    version: API_VERSION,
    url: APP_URL,
  },
  database: buildDatabase(),
  security: buildSecurity(),
});
