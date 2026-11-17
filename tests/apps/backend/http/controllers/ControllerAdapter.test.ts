import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';
import { ControllerAdapter } from '@apps/backend/http/controllers/ControllerAdapter';

import { ExpressResponseAdapter } from '@shared/infrastructure/http/express/ExpressResponseAdapter';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';

import type { NextFunction, Request, Response } from 'express';

vi.mock('@shared/infrastructure/http/express/ExpressResponseAdapter', () => ({
  ExpressResponseAdapter: {
    send: vi.fn(),
  },
}));

const createRes = (): Response => {
  const res = {
    cookie: vi.fn(),
    set: vi.fn(),
    json: vi.fn(),
    status: vi.fn(),
    setHeader: vi.fn(),
    end: vi.fn(),
  };

  return res as unknown as Response;
};

const createReq = (overrides: Partial<IHttpRequest> = {}): Request => {
  const req = {
    body: overrides.body ?? {},
    params: overrides.params ?? {},
    query: overrides.query ?? {},
    headers: (overrides.headers ?? {}) as Record<string, unknown>,
  };

  return req as unknown as Request;
};

describe('ControllerAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps the express request into an http request', async () => {
    const handle = vi.fn().mockResolvedValue({ body: { success: true, status: 200, content: null } });
    const controller: IController = { handle };
    const req = createReq({
      body: { a: 1 },
      params: { id: 'x' },
      query: { q: 'y' },
      headers: { 'content-type': 'application/json' },
    });
    const res = createRes();
    const next = vi.fn() as unknown as NextFunction;

    ControllerAdapter(controller)(req, res, next);
    await vi.waitFor(() => expect(handle).toHaveBeenCalledTimes(1));

    expect(handle).toHaveBeenCalledWith({
      body: { a: 1 },
      params: { id: 'x' },
      query: { q: 'y' },
      headers: { 'content-type': 'application/json' },
    });
  });

  it('forwards the controller response to the express response adapter', async () => {
    const response: HttpResponse<unknown> = {
      body: { success: true, status: 200, content: { ok: true } },
    };
    const controller: IController = { handle: vi.fn().mockResolvedValue(response) };
    const req = createReq();
    const res = createRes();
    const next = vi.fn() as unknown as NextFunction;

    ControllerAdapter(controller)(req, res, next);
    await vi.waitFor(() =>
      expect(vi.mocked(ExpressResponseAdapter.send)).toHaveBeenCalledTimes(1)
    );

    expect(vi.mocked(ExpressResponseAdapter.send)).toHaveBeenCalledWith(req, res, response);
  });

  it('writes every cookie returned by the controller', async () => {
    const response: HttpResponse<unknown> = {
      body: { success: true, status: 200, content: null },
      cookies: [
        { name: 'a', value: '1', options: { httpOnly: true } },
        { name: 'b', value: '2', options: { httpOnly: false } },
      ],
    };
    const controller: IController = { handle: vi.fn().mockResolvedValue(response) };
    const res = createRes();
    const cookieSpy = vi.mocked(res.cookie);

    ControllerAdapter(controller)(createReq(), res, vi.fn() as unknown as NextFunction);
    await vi.waitFor(() => expect(cookieSpy).toHaveBeenCalledTimes(2));

    expect(cookieSpy).toHaveBeenNthCalledWith(1, 'a', '1', { httpOnly: true });
    expect(cookieSpy).toHaveBeenNthCalledWith(2, 'b', '2', { httpOnly: false });
  });

  it('applies the headers returned by the controller', async () => {
    const response: HttpResponse<unknown> = {
      body: { success: true, status: 200, content: null },
      headers: { 'x-custom': 'value' },
    };
    const controller: IController = { handle: vi.fn().mockResolvedValue(response) };
    const res = createRes();
    const setSpy = vi.mocked(res.set);

    ControllerAdapter(controller)(createReq(), res, vi.fn() as unknown as NextFunction);
    await vi.waitFor(() => expect(setSpy).toHaveBeenCalledTimes(1));

    expect(setSpy).toHaveBeenCalledWith({ 'x-custom': 'value' });
  });

  it('does not touch cookies nor headers when the response has none', async () => {
    const response: HttpResponse<unknown> = {
      body: { success: true, status: 200, content: null },
    };
    const controller: IController = { handle: vi.fn().mockResolvedValue(response) };
    const res = createRes();

    ControllerAdapter(controller)(createReq(), res, vi.fn() as unknown as NextFunction);
    await vi.waitFor(() =>
      expect(vi.mocked(ExpressResponseAdapter.send)).toHaveBeenCalledTimes(1)
    );

    expect(vi.mocked(res.cookie)).not.toHaveBeenCalled();
    expect(vi.mocked(res.set)).not.toHaveBeenCalled();
  });

  it('delegates controller failures to the next function', async () => {
    const error = new Error('controller exploded');
    const controller: IController = { handle: vi.fn().mockRejectedValue(error) };
    const next = vi.fn() as unknown as NextFunction;

    ControllerAdapter(controller)(createReq(), createRes(), next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledTimes(1));

    expect(next).toHaveBeenCalledWith(error);
  });
});
