import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExpressAuditDataFactory } from '@shared/infrastructure/http/express/ExpressAuditDataFactory';

import type { Request } from 'express';

type RequestOverrides = Partial<{
  ip: string | undefined;
  ips: string[];
  hostname: string | undefined;
  headers: Record<string, string>;
  path: string | undefined;
  originalUrl: string | undefined;
}>;

const buildRequest = (overrides: RequestOverrides = {}): Request => {
  const base = {
    ip: '127.0.0.1',
    ips: [] as string[],
    hostname: 'localhost',
    headers: { 'user-agent': 'vitest-agent' } as Record<string, string>,
    path: '/api/v1/messages',
    originalUrl: '/api/v1/messages?page=1',
  };

  const merged = { ...base, ...overrides };

  return merged as unknown as Request;
};

describe('ExpressAuditDataFactory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps the request path into the audit data', () => {
    const req = buildRequest({ path: '/api/v1/instance' });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData.path).toBe('/api/v1/instance');
  });

  it('maps the original url into the audit data', () => {
    const req = buildRequest({ originalUrl: '/api/v1/instance?x=1' });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData.url).toBe('/api/v1/instance?x=1');
  });

  it('maps the client ip into the audit data', () => {
    const req = buildRequest({ ip: '10.0.0.5' });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData.clientIp).toBe('10.0.0.5');
  });

  it('copies the proxy chain when ips contains entries', () => {
    const req = buildRequest({ ips: ['10.0.0.1', '10.0.0.2'] });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData.proxyChain).toEqual(['10.0.0.1', '10.0.0.2']);
  });

  it('omits the proxy chain when ips is empty', () => {
    const req = buildRequest({ ips: [] });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData).not.toHaveProperty('proxyChain');
  });

  it('maps the hostname into the audit data', () => {
    const req = buildRequest({ hostname: 'api.local' });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData.hostname).toBe('api.local');
  });

  it('maps the user agent header into the audit data', () => {
    const req = buildRequest({ headers: { 'user-agent': 'custom-agent' } });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData.userAgent).toBe('custom-agent');
  });

  it('omits the user agent when the header is missing', () => {
    const req = buildRequest({ headers: {} });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData).not.toHaveProperty('userAgent');
  });

  it('omits path, url, ip and hostname when they are not available', () => {
    const req = buildRequest({
      path: undefined,
      originalUrl: undefined,
      ip: undefined,
      hostname: undefined,
    });

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData).not.toHaveProperty('path');
    expect(auditData).not.toHaveProperty('url');
    expect(auditData).not.toHaveProperty('clientIp');
    expect(auditData).not.toHaveProperty('hostname');
  });

  it('always sets an ISO timestamp', () => {
    const req = buildRequest();

    const auditData = ExpressAuditDataFactory.create(req);

    expect(auditData.timestamp).toBeDefined();
    expect(auditData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(Number.isNaN(Date.parse(auditData.timestamp as string))).toBe(false);
  });

  it('returns a new object on every invocation', () => {
    const req = buildRequest();

    const first = ExpressAuditDataFactory.create(req);
    const second = ExpressAuditDataFactory.create(req);

    expect(first).not.toBe(second);
    expect(first.path).toBe(second.path);
    expect(first.url).toBe(second.url);
    expect(first.clientIp).toBe(second.clientIp);
  });
});
