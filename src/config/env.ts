import { URL } from 'url';

import { IConfig } from '.';

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
function toPort(name: string, value?: string): number {
  const n = toNumber(name, value);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    throw new Error(`${name} must be a valid port (1–65535), got: ${value}`);
  }
  return n;
}

const JWT_DURATION_RE = /^\d+[smhd]$/;
function parseJwtExpiry(name: string, value: string): string {
  if (!JWT_DURATION_RE.test(value))
    throw new Error(`${name} format invalid: use e.g. '1d', '2h', '30m'`);
  return value;
}

function parseOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter((o) => {
      try {
        return ['http:', 'https:'].includes(new URL(o).protocol);
      } catch {
        return false;
      }
    });
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
const PORT = toPort('PORT', process.env.PORT ?? '3333');
const ENVIRONMENT = parseEnvironment(process.env.NODE_ENV);
const API_PATH = process.env.API_PATH || 'api';
const API_VERSION = process.env.API_VERSION || 'v1';
const APP_URL =
  process.env.APP_URL ??
  (ENVIRONMENT === 'production'
    ? (() => {
        throw new Error('APP_URL is required in production');
      })()
    : `http://localhost:${PORT}`);

const WEAK_SECRETS = ['secret', 'password', 'changeme', '1234', 'test', 'dev'];

function validateJwtSecret(secret: string): string {
  if (ENVIRONMENT === 'production' && secret.length < 32)
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  if (WEAK_SECRETS.some((w) => secret.toLowerCase().includes(w)))
    console.warn('[config] JWT_SECRET looks weak — use a cryptographically random value');
  return secret;
}

function buildCorsOrigins(): string[] {
  const raw = process.env.ACCEPTED_ORIGINS ?? '';
  if (!raw && ENVIRONMENT === 'production')
    throw new Error('ACCEPTED_ORIGINS is required in production');

  const origins = raw
    ? parseOrigins(raw)
    : ['http://localhost:8080', 'http://localhost:4200', 'http://localhost:3000'];

  if (origins.length === 0) throw new Error('ACCEPTED_ORIGINS contains no valid URLs');

  return origins;
}

function buildSecurity(): IConfig['security'] {
  const SECURITY_TYPE = required('SECURITY_TYPE', process.env.SECURITY_TYPE);
  const corsOrigins = buildCorsOrigins();

  const base = {
    cors: { origins: corsOrigins },
    protectRoutes: toBoolean(process.env.PROTECT_ROUTES),
    enabledRateLimit: toBoolean(process.env.ENABLED_RATE_LIMITS),
  };

  switch (SECURITY_TYPE) {
    case 'jwt':
      return {
        ...base,
        type: 'jwt',
        enabled: true,
        jwt: {
          secret: validateJwtSecret(required('JWT_SECRET', process.env.JWT_SECRET)),
          expires: parseJwtExpiry('JWT_EXPIRES', process.env.JWT_EXPIRES || '1d'),
          refreshExpires: parseJwtExpiry(
            'JWT_REFRESH_EXPIRES',
            process.env.JWT_REFRESH_EXPIRES || '7d'
          ),
        },
      };

    case 'oauth2':
      return {
        ...base,
        type: 'oauth2',
        enabled: true,
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
