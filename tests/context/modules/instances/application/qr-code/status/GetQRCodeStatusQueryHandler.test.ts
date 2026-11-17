import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GetQRCodeStatusQueryHandler } from '@modules/instances/application/qr-code/status/GetQRCodeStatusQueryHandler';
import { GetQRCodeStatusQuery } from '@modules/instances/application/qr-code/status/GetQRCodeStatusQuery';
import { QRCodeStatus } from '@modules/instances/application/qr-code/status/QRCodeStatus';

describe('GetQRCodeStatusQueryHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps the QR status returned by the use case', async () => {
    // Arrange
    const status = { status: 'connected', qrCode: null, qrText: null, phoneNumber: null, qrStatus: 'pending' as const, connected: true };
    const useCase = { execute: vi.fn().mockResolvedValue(status) } as unknown as QRCodeStatus;
    const handler = new GetQRCodeStatusQueryHandler(useCase);

    // Act
    const response = await handler.handle(new GetQRCodeStatusQuery('instance-1'));

    // Assert
    expect(handler.subscribedTo()).toBe(GetQRCodeStatusQuery);
    expect(response.content).toEqual(status);
  });
});
