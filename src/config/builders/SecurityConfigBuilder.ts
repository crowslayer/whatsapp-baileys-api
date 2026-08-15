import { envString } from '@shared/infrastructure/utils/EnvironmentParser';

import {
  parseEnvironment,
  parseJwtExpiry,
  parseOrigins,
  required,
  toBoolean,
} from '@config/builders/Utils';
import { ISecurityConfig } from '@config/index';

export class SecurityConfigBuilder {
  static build(): ISecurityConfig {
    const environment = parseEnvironment(process.env.NODE_ENV);

    const SECURITY_TYPE = required('SECURITY_TYPE', process.env.SECURITY_TYPE);
    const corsOrigins = SecurityConfigBuilder.buildCorsOrigins(environment);
    const protectedRoutes =
      environment === 'production' ? true : toBoolean(process.env.PROTECT_ROUTES);

    const base = {
      cors: { origins: corsOrigins },
      protectRoutes: protectedRoutes,
      enabledRateLimit: toBoolean(process.env.ENABLED_RATE_LIMITS),
    };

    switch (SECURITY_TYPE) {
      case 'jwt':
        return {
          ...base,
          type: 'jwt',
          enabled: protectedRoutes,
          jwt: {
            algorithm: 'RS256',
            keys: {
              privateKeyPath: envString('JWT_PRIVATE_KEY_PATH', './certs/jwt-private.pem'),
              publicKeyPath: envString('JWT_PUBLIC_KEY_PATH', './certs/jwt-public.pem'),
            },
            expires: parseJwtExpiry('JWT_EXPIRES', process.env.JWT_EXPIRES || '1d'),
            refreshExpires: parseJwtExpiry(
              'JWT_REFRESH_EXPIRES',
              process.env.JWT_REFRESH_EXPIRES || '7d'
            ),
            issuer: envString('JWT_ISSUER'),
            auddience: envString('JWT_AUDIENCE'),
          },
        };

      case 'oauth2':
        return {
          ...base,
          type: 'oauth2',
          enabled: protectedRoutes,
          oauth2: {
            clientId: required('OAUTH_CLIENT_ID', process.env.OAUTH_CLIENT_ID),
            clientSecret: required('OAUTH_CLIENT_SECRET', process.env.OAUTH_CLIENT_SECRET),
            authorizationServer: required('OAUTH_AUTH_SERVER', process.env.OAUTH_AUTH_SERVER),
          },
        };

      default:
        throw new Error(`Unsupported SECURITY_TYPE: "${SECURITY_TYPE}". Use jwt | oauth2`);
    }
  }

  private static buildCorsOrigins(environment: string): string[] {
    const raw = process.env.ACCEPTED_ORIGINS ?? '';

    if (!raw && environment === 'production')
      throw new Error('ACCEPTED_ORIGINS is required in production');

    const origins = raw
      ? parseOrigins(raw)
      : ['http://localhost:8080', 'http://localhost:4200', 'http://localhost:3000'];

    if (origins.length === 0) throw new Error('ACCEPTED_ORIGINS contains no valid URLs');

    return origins;
  }

  private static validateJwtSecret(environment: string, secret: string): string {
    const WEAK_SECRETS = ['secret', 'password', 'changeme', '1234', 'test', 'dev'];

    if (environment === 'production' && secret.length < 32)
      throw new Error('JWT_SECRET must be at least 32 characters in production');

    if (WEAK_SECRETS.some((w) => secret.toLowerCase().includes(w)))
      console.warn('[config] JWT_SECRET looks weak — use a cryptographically random value');

    return secret;
  }
}
