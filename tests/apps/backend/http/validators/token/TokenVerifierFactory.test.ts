import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IConfig } from '@apps/backend/config';
import { TokenVerifierFactory } from '@apps/backend/http/validators/token/TokenVerifierFactory';
import { JwtAdapter } from '@apps/backend/http/validators/token/JwtAdapter';

import { ConfigurationError } from '@shared/infrastructure/errors/ConfigurationError';

vi.mock('@apps/backend/http/validators/token/JwtAdapter', () => ({
  JwtAdapter: vi.fn(function (this: Record<string, unknown>, config: unknown) {
    this.config = config;
  }),
}));

const createConfig = (type: string): IConfig =>
  ({
    environment: 'test',
    api: { port: 3000, path: '/api', version: '1', url: null },
    security: {
      type,
      enabled: true,
      protectRoutes: true,
      cors: { origins: ['http://localhost:3000'] },
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

describe('TokenVerifierFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a JwtAdapter when the security type is jwt', () => {
    const config = createConfig('jwt');

    const verifier = TokenVerifierFactory.createTokenVerifier(config);

    expect(verifier).toBeInstanceOf(JwtAdapter);
    expect(vi.mocked(JwtAdapter)).toHaveBeenCalledTimes(1);
  });

  it('passes the jwt configuration to the adapter', () => {
    const config = createConfig('jwt');

    TokenVerifierFactory.createTokenVerifier(config);

    const call = vi.mocked(JwtAdapter).mock.calls[0];

    expect(call?.[0]).toEqual(
      (config.security as unknown as { jwt: unknown }).jwt
    );
  });

  it('throws a ConfigurationError for unsupported security types', () => {
    const config = createConfig('basic');

    expect(() => TokenVerifierFactory.createTokenVerifier(config)).toThrow(
      ConfigurationError
    );
  });

  it('throws a ConfigurationError when the security section is missing', () => {
    const config = { environment: 'test' } as unknown as IConfig;

    expect(() => TokenVerifierFactory.createTokenVerifier(config)).toThrow(
      'Unsupported security type: undefined'
    );
  });
});
