import { beforeEach, describe, expect, it, vi } from 'vitest';

import { validate } from '@apps/backend/http/middlewares/ValidationMiddleware';

import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { ExpressResponseAdapter } from '@shared/infrastructure/http/express/ExpressResponseAdapter';

import { checkSchema, validationResult } from 'express-validator';
import type { Schema, ValidationChain } from 'express-validator';
import type { NextFunction, Request, Response } from 'express';

vi.mock('express-validator', () => ({
  checkSchema: vi.fn(),
  validationResult: vi.fn(),
}));

vi.mock('@shared/infrastructure/http/response/ResponseBuilder', () => ({
  ResponseBuilder: {
    error: vi.fn(),
  },
}));

vi.mock('@shared/infrastructure/http/express/ExpressResponseAdapter', () => ({
  ExpressResponseAdapter: { send: vi.fn() },
}));

const createRes = (): Response => ({}) as unknown as Response;

const createReq = (): Request => ({}) as unknown as Request;

describe('validate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs every validation chain of an array input', async () => {
    const runOne = vi.fn().mockResolvedValue(undefined);
    const runTwo = vi.fn().mockResolvedValue(undefined);
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as unknown as ReturnType<typeof validationResult>);

    const chains = [{ run: runOne }, { run: runTwo }] as unknown as ValidationChain[];

    await validate(chains)(createReq(), createRes(), vi.fn() as unknown as NextFunction);

    expect(runOne).toHaveBeenCalledTimes(1);
    expect(runTwo).toHaveBeenCalledTimes(1);
    expect(checkSchema).not.toHaveBeenCalled();
  });

  it('runs the schema through checkSchema when the input is not an array', async () => {
    const run = vi.fn().mockResolvedValue(undefined);
    vi.mocked(checkSchema).mockReturnValue({ run } as unknown as ReturnType<typeof checkSchema>);
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as unknown as ReturnType<typeof validationResult>);
    const schema: Schema = { name: { in: ['body'], isString: true } };

    await validate(schema)(createReq(), createRes(), vi.fn() as unknown as NextFunction);

    expect(checkSchema).toHaveBeenCalledWith(schema);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('calls next when there are no validation errors', async () => {
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as unknown as ReturnType<typeof validationResult>);
    const next = vi.fn() as unknown as NextFunction;

    const chains = [{ run: vi.fn().mockResolvedValue(undefined) }] as unknown as ValidationChain[];

    await validate(chains)(createReq(), createRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(ResponseBuilder.error).not.toHaveBeenCalled();
  });

  it('maps the field errors into the response builder', async () => {
    const request = createReq();
    const response = createRes();
    const errorResponse = { body: { status: 400 } };
    vi.mocked(ResponseBuilder.error).mockReturnValue(errorResponse as never);
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { type: 'field', path: 'name', msg: 'Name is required' },
        { type: 'field', path: 'phoneNumber', msg: 'Phone number malformed' },
      ],
    } as unknown as ReturnType<typeof validationResult>);
    const next = vi.fn() as unknown as NextFunction;

    const chains = [{ run: vi.fn().mockResolvedValue(undefined) }] as unknown as ValidationChain[];

    await validate(chains)(request, response, next);

    expect(ResponseBuilder.error).toHaveBeenCalledWith(
      [
        { type: 'field', code: 2001, name: 'name', description: 'Name is required' },
        { type: 'field', code: 2001, name: 'phoneNumber', description: 'Phone number malformed' },
      ],
      400
    );
    expect(next).not.toHaveBeenCalled();
    expect(ExpressResponseAdapter.send).toHaveBeenCalledWith(request, response, errorResponse);
  });

  it('ignores errors that are not of field type', async () => {
    const request = createReq();
    const response = createRes();
    const errorResponse = { body: { status: 400 } };
    vi.mocked(ResponseBuilder.error).mockReturnValue(errorResponse as never);
    vi.mocked(validationResult).mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { type: 'alternative', path: 'name', msg: 'Name is required' },
        { type: 'field', path: 'email', msg: 'Email is required' },
      ],
    } as unknown as ReturnType<typeof validationResult>);

    const chains = [{ run: vi.fn().mockResolvedValue(undefined) }] as unknown as ValidationChain[];

    await validate(chains)(createReq(), createRes(), vi.fn() as unknown as NextFunction);

    expect(ResponseBuilder.error).toHaveBeenCalledWith(
      [{ type: 'field', code: 2001, name: 'email', description: 'Email is required' }],
      400
    );
    expect(ExpressResponseAdapter.send).toHaveBeenCalledWith(request, response, errorResponse);
  });
});
