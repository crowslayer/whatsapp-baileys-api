import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { webhookUrlValidator } from '@apps/backend/http/validators/custom/WebhookUrlValidator';

const { chainMock, bodyMock } = vi.hoisted(() => {
  const chain = {
    optional: vi.fn(),
    isURL: vi.fn(),
    withMessage: vi.fn(),
    custom: vi.fn(),
  };

  chain.optional.mockReturnValue(chain);
  chain.isURL.mockReturnValue(chain);
  chain.withMessage.mockReturnValue(chain);
  chain.custom.mockReturnValue(chain);

  return { chainMock: chain, bodyMock: vi.fn(() => chain) };
});

vi.mock('express-validator', () => ({
  body: bodyMock,
}));

const customValidator = (): ((value: unknown) => boolean) =>
  vi.mocked(chainMock.custom).mock.calls[0]?.[0] as (value: unknown) => boolean;

describe('webhookUrlValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds the chain for the webhookUrl field', () => {
    const result = webhookUrlValidator();

    expect(bodyMock).toHaveBeenCalledWith('webhookUrl');
    expect(result).toBe(chainMock);
  });

  it('marks the field as optional', () => {
    webhookUrlValidator();

    expect(chainMock.optional).toHaveBeenCalledTimes(1);
  });

  it('accepts http and https outside production', () => {
    webhookUrlValidator();

    expect(chainMock.isURL).toHaveBeenCalledWith({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: true,
    });
    expect(chainMock.withMessage).toHaveBeenCalledWith('Invalid webhook URL');
  });

  it('only accepts https in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    webhookUrlValidator();

    expect(chainMock.isURL).toHaveBeenCalledWith({
      protocols: ['https'],
      require_protocol: true,
      require_tld: true,
    });
    expect(chainMock.withMessage).toHaveBeenCalledWith(
      'Webhook URL must use HTTPS protocol in production'
    );
  });

  it('accepts an empty value in the custom validator', () => {
    webhookUrlValidator();

    expect(customValidator()(undefined)).toBe(true);
  });

  it('accepts a valid https url in the custom validator', () => {
    webhookUrlValidator();

    expect(customValidator()('https://hooks.example.com/path')).toBe(true);
  });

  it('rejects a malformed url in the custom validator', () => {
    webhookUrlValidator();

    expect(() => customValidator()('not a url')).toThrow();
  });

  it('rejects an http url in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    webhookUrlValidator();

    expect(() => customValidator()('http://hooks.example.com/path')).toThrow(
      'Webhook URL must use HTTPS protocol in production'
    );
  });
});
