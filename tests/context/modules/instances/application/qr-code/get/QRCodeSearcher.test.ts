import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QRCodeSearcher } from '@modules/instances/application/qr-code/get/QRCodeSearcher';
import type { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';

describe('QRCodeSearcher', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('returns ready data when a QR code exists and pending when state is absent', async () => {
    // Arrange
    const store = { get: vi.fn().mockResolvedValueOnce({ status: 'connecting', qr: { base64: 'data:image/png;base64,abc', text: 'scan-me' } }).mockResolvedValueOnce(null) } as unknown as IConnectionStateStore;
    const searcher = new QRCodeSearcher(store);

    // Act
    const ready = await searcher.execute('instance-1');
    const pending = await searcher.execute('instance-2');

    // Assert
    expect(ready).toMatchObject({ status: 'connecting', qrStatus: 'ready', qrText: 'scan-me' });
    expect(pending).toMatchObject({ status: 'pending', qrStatus: 'pending', qrCode: null });
  });
});
