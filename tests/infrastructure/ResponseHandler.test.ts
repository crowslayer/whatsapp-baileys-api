import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('ResponseHandler', () => {
  let ResponseHandler: any;
  let res: any;

  beforeAll(async () => {
    const mod = await import('../../src/shared/infrastructure/ResponseHandler');
    ResponseHandler = mod.ResponseHandler;
  });

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
      locals: { requestId: 'req-999' },
    };
  });

  // ======================
  // SUCCESS
  // ======================
  test('success sends full response structure', () => {
    ResponseHandler.success(res, { id: 1 }, 'OK', 200);

    expect(res.status).toHaveBeenCalledWith(200);

    const response = res.json.mock.calls[0][0];

    expect(response).toEqual(
      expect.objectContaining({
        success: true,
        message: 'OK',
        data: { id: 1 },
        metadata: expect.objectContaining({
          requestId: 'req-999',
          audit: undefined,
        }),
      })
    );

    expect(response.metadata.timestamp).toBeInstanceOf(Date);
  });

  // ======================
  // CREATED
  // ======================
  test('created calls success with 201', () => {
    ResponseHandler.created(res, { id: 1 }, 'Created');

    expect(res.status).toHaveBeenCalledWith(201);

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(true);
    expect(response.message).toBe('Created');
  });

  // ======================
  // FALLBACK requestId
  // ======================
  test('generates requestId when missing', () => {
    res.locals = {}; // fuerza fallback

    ResponseHandler.success(res, { ok: true });

    const response = res.json.mock.calls[0][0];

    expect(response.metadata.requestId).toMatch(/^req_/);
  });

  // ======================
  // ERROR RESPONSE
  // ======================
  test('error response structure is correct', () => {
    ResponseHandler.error(res, 500, [{ code: 1, type: 'X', name: 'E', description: 'D' }]);

    const response = res.json.mock.calls[0][0];

    expect(response.success).toBe(false);
    expect(response.errors).toHaveLength(1);
    expect(response.metadata.requestId).toBe('req-999');
  });

  // ======================
  // NO CONTENT
  // ======================
  test('noContent sends 204 without body', () => {
    ResponseHandler.noContent(res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled?.();
  });
});
