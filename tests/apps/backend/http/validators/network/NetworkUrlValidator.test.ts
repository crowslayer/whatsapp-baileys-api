import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  INetworkValidationConfig,
  NetworkUrlValidator,
} from '@apps/backend/http/validators/network/NetworkUrlValidator';

import dns from 'node:dns/promises';

vi.mock('node:dns/promises', () => ({
  default: {
    resolve4: vi.fn(),
    resolve6: vi.fn(),
  },
}));

const createConfig = (
  overrides: Partial<INetworkValidationConfig> = {}
): INetworkValidationConfig => ({
  enabled: true,
  validateDns: false,
  allowedProtocols: ['https'],
  allowedPorts: [443],
  allowedHosts: ['example.com'],
  blockPrivateNetworks: true,
  blockLoopback: true,
  blockLinkLocal: true,
  blockMulticast: true,
  blockReserved: true,
  ...overrides,
});

describe('NetworkUrlValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dns.resolve4).mockResolvedValue([]);
    vi.mocked(dns.resolve6).mockResolvedValue([]);
  });

  it('skips every check when the validation is disabled', async () => {
    const validator = new NetworkUrlValidator(createConfig({ enabled: false }));

    await expect(validator.validate('not-a-url')).resolves.toBeUndefined();
  });

  it('rejects a protocol that is not allowed', async () => {
    const validator = new NetworkUrlValidator(createConfig({ allowedProtocols: ['https'] }));

    await expect(validator.validate('http://example.com')).rejects.toThrow(
      'Protocol "http:" is not allowed.'
    );
  });

  it('rejects urls carrying credentials', async () => {
    const validator = new NetworkUrlValidator(createConfig());

    await expect(validator.validate('https://user:pass@example.com')).rejects.toThrow(
      'URL credentials are not allowed.'
    );
  });

  it('rejects a port that is not allowed', async () => {
    const validator = new NetworkUrlValidator(createConfig({ allowedPorts: [443] }));

    await expect(validator.validate('https://example.com:8080')).rejects.toThrow(
      'Port 8080 is not allowed.'
    );
  });

  it('uses 443 as the default port when the url has none', async () => {
    const validator = new NetworkUrlValidator(createConfig({ allowedPorts: [443] }));

    await expect(validator.validate('https://example.com')).resolves.toBeUndefined();
  });

  it('rejects a host that is not allowed', async () => {
    const validator = new NetworkUrlValidator(createConfig({ allowedHosts: ['example.com'] }));

    await expect(validator.validate('https://other.com')).rejects.toThrow(
      'Host "other.com" is not allowed.'
    );
  });

  it('accepts every host when the wildcard is configured', async () => {
    const validator = new NetworkUrlValidator(createConfig({ allowedHosts: ['*'] }));

    await expect(validator.validate('https://other.com')).resolves.toBeUndefined();
  });

  it('accepts hosts matching a wildcard pattern', async () => {
    const validator = new NetworkUrlValidator(createConfig({ allowedHosts: ['*.example.com'] }));

    await expect(validator.validate('https://api.example.com')).resolves.toBeUndefined();
  });

  it('rejects hosts that do not match a wildcard pattern', async () => {
    const validator = new NetworkUrlValidator(createConfig({ allowedHosts: ['*.example.com'] }));

    await expect(validator.validate('https://example.org')).rejects.toThrow(
      'Host "example.org" is not allowed.'
    );
  });

  it('does not resolve dns when the dns validation is disabled', async () => {
    const validator = new NetworkUrlValidator(createConfig({ validateDns: false }));

    await validator.validate('https://example.com');

    expect(dns.resolve4).not.toHaveBeenCalled();
    expect(dns.resolve6).not.toHaveBeenCalled();
  });

  it('rejects hosts that cannot be resolved', async () => {
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).rejects.toThrow(
      'Unable to resolve host "example.com".'
    );
  });

  it('accepts hosts resolving to a public address', async () => {
    vi.mocked(dns.resolve4).mockResolvedValue(['93.184.216.34']);
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).resolves.toBeUndefined();
  });

  it('rejects hosts resolving to a loopback address', async () => {
    vi.mocked(dns.resolve4).mockResolvedValue(['127.0.0.1']);
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).rejects.toThrow(
      'Host resolves to blocked address "127.0.0.1".'
    );
  });

  it('rejects hosts resolving to a private address', async () => {
    vi.mocked(dns.resolve4).mockResolvedValue(['192.168.1.10']);
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).rejects.toThrow(
      'Host resolves to blocked address "192.168.1.10".'
    );
  });

  it('rejects hosts resolving to a link local address', async () => {
    vi.mocked(dns.resolve4).mockResolvedValue(['169.254.10.10']);
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).rejects.toThrow(
      'Host resolves to blocked address "169.254.10.10".'
    );
  });

  it('rejects hosts resolving to a multicast address', async () => {
    vi.mocked(dns.resolve4).mockResolvedValue(['224.0.0.1']);
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).rejects.toThrow(
      'Host resolves to blocked address "224.0.0.1".'
    );
  });

  it('rejects hosts resolving to the reserved address', async () => {
    vi.mocked(dns.resolve4).mockResolvedValue(['0.0.0.0']);
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).rejects.toThrow(
      'Host resolves to blocked address "0.0.0.0".'
    );
  });

  it('rejects hosts resolving to a private ipv6 address', async () => {
    vi.mocked(dns.resolve6).mockResolvedValue(['fd00::1']);
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).rejects.toThrow(
      'Host resolves to blocked address "fd00::1".'
    );
  });

  it('rejects hosts resolving to the ipv6 loopback address', async () => {
    vi.mocked(dns.resolve6).mockResolvedValue(['::1']);
    const validator = new NetworkUrlValidator(createConfig({ validateDns: true }));

    await expect(validator.validate('https://example.com')).rejects.toThrow(
      'Host resolves to blocked address "::1".'
    );
  });

  it('allows private addresses when the blocking rules are disabled', async () => {
    vi.mocked(dns.resolve4).mockResolvedValue(['127.0.0.1']);
    const validator = new NetworkUrlValidator(
      createConfig({
        validateDns: true,
        blockLoopback: false,
        blockPrivateNetworks: false,
      })
    );

    await expect(validator.validate('https://example.com')).resolves.toBeUndefined();
  });
});
