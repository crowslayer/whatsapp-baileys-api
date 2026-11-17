import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IJwtConfig } from '@apps/backend/config';
import { JwtAdapter } from '@apps/backend/http/validators/token/JwtAdapter';

import { ConfigurationError } from '@shared/infrastructure/errors/ConfigurationError';
import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

import fs from 'node:fs';
import type { SignOptions, VerifyOptions } from 'jsonwebtoken';

const jwtMock = vi.hoisted(() => ({
  sign: vi.fn<(payload: unknown, key: unknown, options?: SignOptions) => string>(),
  verify: vi.fn<(token: string, key: unknown, options?: VerifyOptions) => unknown>(),
}));

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: jwtMock,
}));

const createConfig = (overrides: Partial<IJwtConfig> = {}): IJwtConfig => ({
  algorithm: 'RS256',
  keys: {
    privateKeyPath: './certs/private.pem',
    publicKeyPath: './certs/public.pem',
  },
  expires: '15m',
  refreshExpires: '7d',
  issuer: 'issuer',
  audience: 'audience',
  ...overrides,
});

const mockKeys = (privateKey = '-----BEGIN PRIVATE KEY-----', publicKey = '-----BEGIN PUBLIC KEY-----') => {
  vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
    if (String(filePath).includes('private')) return privateKey;
    if (String(filePath).includes('public')) return publicKey;

    return '';
  });
};

describe('JwtAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockKeys();
  });

  it('reads both key files on construction', () => {
    new JwtAdapter(createConfig());

    expect(fs.readFileSync).toHaveBeenCalledTimes(2);
  });

  it('throws a ConfigurationError when the private key looks invalid', () => {
    mockKeys('not-a-key', '-----BEGIN PUBLIC KEY-----');

    expect(() => new JwtAdapter(createConfig())).toThrow(ConfigurationError);
  });

  it('throws a ConfigurationError when the public key looks invalid', () => {
    mockKeys('-----BEGIN PRIVATE KEY-----', 'not-a-key');

    expect(() => new JwtAdapter(createConfig())).toThrow(ConfigurationError);
  });

  it('signs the payload with RS256 and the configured options', () => {
    jwtMock.sign.mockReturnValue('signed-token');
    const adapter = new JwtAdapter(createConfig());

    const token = adapter.generate({ userId: 'user-1' });

    expect(token).toBe('signed-token');
    expect(jwtMock.sign).toHaveBeenCalledWith(
      { userId: 'user-1' },
      '-----BEGIN PRIVATE KEY-----',
      expect.objectContaining({
        algorithm: 'RS256',
        expiresIn: '15m',
        issuer: 'issuer',
        audience: 'audience',
      })
    );
  });

  it('falls back to 15m when the expiration is not configured', () => {
    jwtMock.sign.mockReturnValue('signed-token');
    const adapter = new JwtAdapter(createConfig({ expires: undefined as unknown as number }));

    adapter.generate({ userId: 'user-1' });

    expect(jwtMock.sign).toHaveBeenCalledWith(
      { userId: 'user-1' },
      expect.any(String),
      expect.objectContaining({ expiresIn: '15m' })
    );
  });

  it('rejects a null payload', () => {
    const adapter = new JwtAdapter(createConfig());

    expect(() => adapter.generate(null as unknown as { userId: string })).toThrow(
      UnauthorizedError
    );
  });

  it('rejects an empty token', () => {
    const adapter = new JwtAdapter(createConfig());

    expect(() => adapter.verify('')).toThrow(UnauthorizedError);
    expect(() => adapter.verify(undefined as unknown as string)).toThrow('Invalid JWT');
  });

  it('verifies the token with the public key and the configured constraints', () => {
    jwtMock.verify.mockReturnValue({
      sub: 'user-1',
      iss: 'issuer',
      aud: 'audience',
      iat: 1000,
      exp: 2000,
    });
    const adapter = new JwtAdapter(createConfig());

    adapter.verify('a-token');

    expect(jwtMock.verify).toHaveBeenCalledWith('a-token', '-----BEGIN PUBLIC KEY-----', {
      algorithms: ['RS256'],
      issuer: 'issuer',
      audience: 'audience',
      maxAge: '15m',
      clockTolerance: 5,
    });
  });

  it('returns the mapped payload', () => {
    jwtMock.verify.mockReturnValue({
      sub: 'user-1',
      iss: 'issuer',
      aud: 'audience',
      iat: 1000,
      exp: 2000,
      extra: 'ignored',
    });
    const adapter = new JwtAdapter(createConfig());

    const payload = adapter.verify('a-token');

    expect(payload).toEqual({
      sub: 'user-1',
      iss: 'issuer',
      aud: 'audience',
      iat: 1000,
      exp: 2000,
    });
  });

  it('rejects a payload without a string subject', () => {
    jwtMock.verify.mockReturnValue({ sub: 10, iat: 1, exp: 2 });
    const adapter = new JwtAdapter(createConfig());

    expect(() => adapter.verify('a-token')).toThrow('Invalid JWT payload');
  });

  it('rejects a payload with a blank subject', () => {
    jwtMock.verify.mockReturnValue({ sub: '   ', iat: 1, exp: 2 });
    const adapter = new JwtAdapter(createConfig());

    expect(() => adapter.verify('a-token')).toThrow('Invalid JWT payload');
  });

  it('rejects a payload without expiration', () => {
    jwtMock.verify.mockReturnValue({ sub: 'user-1', iat: 1 });
    const adapter = new JwtAdapter(createConfig());

    expect(() => adapter.verify('a-token')).toThrow('Invalid JWT payload');
  });

  it('wraps verification failures into an UnauthorizedError', () => {
    jwtMock.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });
    const adapter = new JwtAdapter(createConfig());

    expect(() => adapter.verify('a-token')).toThrow('Invalid or expired token');
  });
});
