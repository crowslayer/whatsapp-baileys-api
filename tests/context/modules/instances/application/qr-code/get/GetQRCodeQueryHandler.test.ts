import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GetQRCodeQueryHandler } from '@modules/instances/application/qr-code/get/GetQRCodeQueryHandler';
import { GetQRCodeQuery } from '@modules/instances/application/qr-code/get/GetQRCodeQuery';
import { QRCodeSearcher } from '@modules/instances/application/qr-code/get/QRCodeSearcher';

describe('GetQRCodeQueryHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps the QR code search result', async () => {
    // Arrange
    const qr = { instanceId: 'instance-1', status: 'pending', name: '', qrCode: null, qrText: null, qrStatus: 'pending' as const };
    const useCase = { execute: vi.fn().mockResolvedValue(qr) } as unknown as QRCodeSearcher;
    const handler = new GetQRCodeQueryHandler(useCase);

    // Act
    const response = await handler.handle(new GetQRCodeQuery('instance-1'));

    // Assert
    expect(handler.subscribedTo()).toBe(GetQRCodeQuery);
    expect(response.content).toEqual(qr);
  });
});
