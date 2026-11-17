import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AuditData,
  CookieDefinition,
  ErrorContent,
  HttpResponse,
  HttpResponseBody,
} from '@shared/infrastructure/http/response/HttpResponse';

describe('HttpResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('describes a success body with success flag, status and content', () => {
    const body: HttpResponseBody<{ id: string }> = {
      success: true,
      status: 200,
      content: { id: 'abc' },
    };

    expect(body.success).toBe(true);
    expect(body.status).toBe(200);
    expect(body.content).toEqual({ id: 'abc' });
  });

  it('describes an error body with the errors collection', () => {
    const errors: ErrorContent[] = [
      {
        code: 2002,
        type: 'validation_error',
        name: 'ValidationError',
        description: 'missing field',
      },
    ];

    const body: HttpResponseBody<null> = {
      success: false,
      status: 400,
      errors,
      content: null,
    };

    expect(body.success).toBe(false);
    expect(body.status).toBe(400);
    expect(body.errors).toHaveLength(1);
    expect(body.content).toBeNull();
  });

  it('allows an error content to carry an optional cause and stack', () => {
    const errorContent: ErrorContent = {
      code: 5000,
      type: 'internal_server_error',
      name: 'Error',
      description: 'boom',
      cause: new Error('root'),
      stack: 'stack trace',
    };

    expect(errorContent.cause).toBeInstanceOf(Error);
    expect(errorContent.stack).toBe('stack trace');
  });

  it('supports an optional audit data block on the response body', () => {
    const auditData: AuditData = {
      path: '/api/v1/messages',
      url: '/api/v1/messages?page=1',
      clientIp: '127.0.0.1',
      proxyChain: ['10.0.0.1'],
      hostname: 'localhost',
      userAgent: 'vitest',
      timestamp: '2026-01-01T00:00:00.000Z',
    };

    const body: HttpResponseBody<string> = {
      success: true,
      status: 200,
      content: 'ok',
      auditData,
    };

    expect(body.auditData?.clientIp).toBe('127.0.0.1');
    expect(body.auditData?.proxyChain).toEqual(['10.0.0.1']);
  });

  it('allows the audit proxy chain to be a single string', () => {
    const auditData: AuditData = { proxyChain: '10.0.0.1' };

    expect(auditData.proxyChain).toBe('10.0.0.1');
  });

  it('describes a full response envelope with headers and cookies', () => {
    const cookies: CookieDefinition[] = [
      {
        name: 'session',
        value: 'token',
        options: { httpOnly: true, secure: true, sameSite: 'strict' },
      },
    ];

    const response: HttpResponse<{ ok: boolean }> = {
      body: {
        success: true,
        status: 200,
        content: { ok: true },
      },
      headers: { 'X-Custom': 'value' },
      cookies,
    };

    expect(response.headers?.['X-Custom']).toBe('value');
    expect(response.cookies?.[0].name).toBe('session');
    expect(response.cookies?.[0].options.httpOnly).toBe(true);
  });

  it('allows a response without headers nor cookies', () => {
    const response: HttpResponse<string> = {
      body: {
        success: true,
        status: 200,
        content: 'ok',
      },
    };

    expect(response.headers).toBeUndefined();
    expect(response.cookies).toBeUndefined();
  });
});
