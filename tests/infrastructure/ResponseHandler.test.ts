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
      locals: { requestId: 'req-999' },
    };
  });

  test('success sends correct response', () => {
    ResponseHandler.success(res, { id: 1 }, 'OK', 200);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'OK',
        data: { id: 1 },
      })
    );
  });

  test('created sends 201', () => {
    ResponseHandler.created(res, { id: 1 }, 'Created', undefined);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
