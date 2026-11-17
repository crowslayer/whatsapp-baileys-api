import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExpressResponseAdapter } from '@shared/infrastructure/http/express/ExpressResponseAdapter';
import { StatusCode } from '@shared/infrastructure/http/status/StatusCode';

import type { Request, Response } from 'express';
import type { CookieDefinition, HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';

type MockResponse = {
  setHeader: ReturnType<typeof vi.fn>;
  cookie: ReturnType<typeof vi.fn>;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
};

const buildRequest = (): Request =>
  ({
    ip: '127.0.0.1',
    ips: [],
    hostname: 'localhost',
    headers: { 'user-agent': 'vitest-agent' },
    path: '/api/v1/messages',
    originalUrl: '/api/v1/messages',
  }) as unknown as Request;

const buildResponse = (): MockResponse => {
  const res: MockResponse = {
    setHeader: vi.fn(),
    cookie: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
  };

  res.status.mockReturnValue(res);

  return res;
};

const toResponse = (res: MockResponse): Response => res as unknown as Response;

const buildOkResponse = (): HttpResponse<string> => ({
  body: {
    success: true,
    status: StatusCode.SuccessOK,
    content: 'ok',
  },
});

describe('ExpressResponseAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets the status code on the express response', () => {
    const req = buildRequest();
    const res = buildResponse();

    ExpressResponseAdapter.send(req, toResponse(res), buildOkResponse());

    expect(res.status).toHaveBeenCalledWith(StatusCode.SuccessOK);
  });

  it('adds the audit data to successful responses', () => {
    const req = buildRequest();
    const res = buildResponse();

    ExpressResponseAdapter.send(req, toResponse(res), buildOkResponse());

    const payload = res.json.mock.calls[0][0] as Record<string, unknown>;

    expect(payload.auditData).toBeDefined();
    expect((payload.auditData as Record<string, unknown>).path).toBe('/api/v1/messages');
  });

  it('does not add the audit data to error responses', () => {
    const req = buildRequest();
    const res = buildResponse();
    const response: HttpResponse<null> = {
      body: {
        success: false,
        status: StatusCode.ClientErrorBadRequest,
        errors: [],
        content: null,
      },
    };

    ExpressResponseAdapter.send(req, toResponse(res), response);

    const payload = res.json.mock.calls[0][0] as Record<string, unknown>;

    expect(payload).not.toHaveProperty('auditData');
  });

  it('ends the response without a body for 204 status', () => {
    const req = buildRequest();
    const res = buildResponse();
    const response: HttpResponse<null> = {
      body: {
        success: true,
        status: StatusCode.SuccessNoContent,
        content: null,
      },
    };

    ExpressResponseAdapter.send(req, toResponse(res), response);

    expect(res.end).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('applies the security headers on every response', () => {
    const req = buildRequest();
    const res = buildResponse();

    ExpressResponseAdapter.send(req, toResponse(res), buildOkResponse());

    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
  });

  it('applies the custom headers skipping the undefined values', () => {
    const req = buildRequest();
    const res = buildResponse();
    const response = {
      body: buildOkResponse().body,
      headers: { 'X-Ok': 'yes', 'X-Skipped': undefined },
    } as unknown as HttpResponse<string>;

    ExpressResponseAdapter.send(req, toResponse(res), response);

    expect(res.setHeader).toHaveBeenCalledWith('X-Ok', 'yes');
    expect(res.setHeader).not.toHaveBeenCalledWith('X-Skipped', expect.anything());
  });

  it('does not set cookies when the response has none', () => {
    const req = buildRequest();
    const res = buildResponse();

    ExpressResponseAdapter.send(req, toResponse(res), buildOkResponse());

    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('sets the cookies with the secure default options', () => {
    const req = buildRequest();
    const res = buildResponse();
    const cookie = {
      name: 'session',
      value: 'token',
    } as unknown as CookieDefinition;
    const response = {
      body: buildOkResponse().body,
      cookies: [cookie],
    } as unknown as HttpResponse<string>;

    ExpressResponseAdapter.send(req, toResponse(res), response);

    expect(res.cookie).toHaveBeenCalledWith('session', 'token', {
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
    });
  });

  it('sets the cookies with the provided options', () => {
    const req = buildRequest();
    const res = buildResponse();
    const cookie: CookieDefinition = {
      name: 'session',
      value: 'token',
      options: { httpOnly: false, maxAge: 1000 },
    };
    const response = {
      body: buildOkResponse().body,
      cookies: [cookie],
    } as unknown as HttpResponse<string>;

    ExpressResponseAdapter.send(req, toResponse(res), response);

    expect(res.cookie).toHaveBeenCalledWith('session', 'token', { httpOnly: false, maxAge: 1000 });
  });

  it('sends the original body content through res.json', () => {
    const req = buildRequest();
    const res = buildResponse();
    const response: HttpResponse<{ id: number }> = {
      body: {
        success: true,
        status: StatusCode.SuccessCreated,
        content: { id: 7 },
      },
    };

    ExpressResponseAdapter.send(req, toResponse(res), response);

    const payload = res.json.mock.calls[0][0] as Record<string, unknown>;

    expect(payload.success).toBe(true);
    expect(payload.status).toBe(StatusCode.SuccessCreated);
    expect(payload.content).toEqual({ id: 7 });
  });
});
