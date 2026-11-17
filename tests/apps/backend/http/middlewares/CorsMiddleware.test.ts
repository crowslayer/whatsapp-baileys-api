import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IConfig } from '@apps/backend/config';
import { createCorsMiddleware } from '@apps/backend/http/middlewares/CorsMiddleware';

import { ILogger } from '@shared/domain/Logger';

import cors, { CorsOptions } from 'cors';

vi.mock('cors', () => ({
  default: vi.fn(() => 'cors-middleware'),
}));

const createLogger = (): ILogger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
});

const createConfig = (origins: string[], environment = 'development'): IConfig =>
  ({
    environment,
    api: { port: 3000, path: '/api', version: '1', url: null },
    security: {
      type: 'jwt',
      enabled: true,
      protectRoutes: true,
      cors: { origins },
      jwt: {
        algorithm: 'RS256',
        keys: { privateKeyPath: 'a', publicKeyPath: 'b' },
        expires: '1d',
        refreshExpires: '7d',
        issuer: 'issuer',
        audience: 'audience',
      },
    },
  }) as unknown as IConfig;

describe('createCorsMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when the security section is missing', () => {
    const config = { environment: 'development' } as unknown as IConfig;

    expect(() => createCorsMiddleware(config, createLogger())).toThrow(
      'CORS origins not configured'
    );
  });

  it('throws when the cors section is missing', () => {
    const config = { environment: 'development', security: {} } as unknown as IConfig;

    expect(() => createCorsMiddleware(config, createLogger())).toThrow(
      'CORS origins not configured'
    );
  });

  it('throws when the origins list is empty', () => {
    const config = createConfig([]);

    expect(() => createCorsMiddleware(config, createLogger())).toThrow(
      'CORS origins not configured'
    );
  });

  it('delegates the middleware creation to the cors package', () => {
    const handler = createCorsMiddleware(createConfig(['http://localhost:3000']), createLogger());

    expect(handler).toBe('cors-middleware');
    expect(vi.mocked(cors)).toHaveBeenCalledTimes(1);
  });

  it('allows requests without an origin', () => {
    createCorsMiddleware(createConfig(['http://localhost:3000']), createLogger());
    const options = vi.mocked(cors).mock.calls[0]?.[0] as CorsOptions;
    const callback = vi.fn();

    const origin = (options.origin as unknown as (o: string | undefined, cb: unknown) => void)(
      undefined,
      callback
    );

    expect(origin).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it('allows requests coming from a configured origin', () => {
    createCorsMiddleware(createConfig(['http://localhost:3000']), createLogger());
    const options = vi.mocked(cors).mock.calls[0]?.[0] as CorsOptions;
    const callback = vi.fn();

    const origin = (options.origin as unknown as (o: string | undefined, cb: unknown) => void)(
      'http://localhost:3000',
      callback
    );

    expect(origin).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(null, 'http://localhost:3000');
  });

  it('blocks and logs requests coming from an unknown origin', () => {
    const logger = createLogger();
    createCorsMiddleware(createConfig(['http://localhost:3000']), logger);
    const options = vi.mocked(cors).mock.calls[0]?.[0] as CorsOptions;
    const callback = vi.fn();

    const origin = (options.origin as unknown as (o: string | undefined, cb: unknown) => void)(
      'http://evil.com',
      callback
    );

    expect(origin).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(null, false);
    expect(logger.warn).toHaveBeenCalledWith('CORS blocked request', {
      origin: 'http://evil.com',
      allowedOrigins: ['http://localhost:3000'],
      environment: 'development',
    });
  });

  it('configures the expected cors defaults outside production', () => {
    createCorsMiddleware(createConfig(['http://localhost:3000']), createLogger());
    const options = vi.mocked(cors).mock.calls[0]?.[0] as CorsOptions;

    expect(options.methods).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
    expect(options.allowedHeaders).toEqual(['Content-Type', 'Authorization']);
    expect(options.exposedHeaders).toEqual(['X-Request-Id', 'X-Correlation-Id']);
    expect(options.maxAge).toBe(300);
    expect(options.credentials).toBe(false);
    expect(options.optionsSuccessStatus).toBe(204);
  });

  it('uses a longer max age in production', () => {
    createCorsMiddleware(
      createConfig(['https://app.example.com'], 'production'),
      createLogger()
    );
    const options = vi.mocked(cors).mock.calls[0]?.[0] as CorsOptions;

    expect(options.maxAge).toBe(1800);
  });
});
