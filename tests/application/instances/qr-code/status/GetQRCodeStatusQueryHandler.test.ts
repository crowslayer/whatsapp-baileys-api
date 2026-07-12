import { describe, expect, vi } from 'vitest';
import { GetQRCodeStatusQuery } from '../../../../../src/application/instances/qr-code/status/GetQRCodeStatusQuery';
import { GetQRCodeStatusQueryHandler } from '../../../../../src/application/instances/qr-code/status/GetQRCodeStatusQueryHandler';
import { NotFoundError } from '../../../../../src/shared/infrastructure/errors/NotFoundError';

describe('GetQRCodeStatusQueryHandler', () => {
  test('subscribedTo() returns GetQRCodeStatusQuery', () => {
    const handler = new GetQRCodeStatusQueryHandler({ execute: vi.fn() });
    expect(handler.subscribedTo()).toBe(GetQRCodeStatusQuery);
  });

  test('handle returns QRCodeStatusResponse', async () => {
    const instance = {
      status: 'connected',
      qrCode: null,
      qrText: null,
      phoneNumber: '5215512345678',
      qrStatus: 'expired',
      connected: true,
    };
    const mockSearcher = { execute: vi.fn().mockResolvedValue(instance) };
    const handler = new GetQRCodeStatusQueryHandler(mockSearcher);

    const query = new GetQRCodeStatusQuery('inst-1');
    const result = await handler.handle(query);
    expect(result.content.connected).toBe(true);
  });

  test('wraps Error as NotFoundError', async () => {
    const mockSearcher = { execute: vi.fn().mockRejectedValue(new Error('Instance not found')) };
    const handler = new GetQRCodeStatusQueryHandler(mockSearcher);

    const query = new GetQRCodeStatusQuery('inst-none');
    await expect(handler.handle(query)).rejects.toThrow(NotFoundError);
  });
});
