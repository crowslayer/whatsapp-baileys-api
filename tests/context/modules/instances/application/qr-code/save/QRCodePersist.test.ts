import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QRCodePersist } from '@modules/instances/application/qr-code/save/QRCodePersist';
import type { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';

describe('QRCodePersist', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('stores QR image and text in connection state', async () => {
    // Arrange
    const store = { setQR: vi.fn().mockResolvedValue(undefined) } as unknown as IConnectionStateStore;
    const persist = new QRCodePersist(store);

    // Act
    await persist.execute({ instanceId: 'instance-1', qrCode: 'base64', qrText: 'scan-me' });

    // Assert
    expect(store.setQR).toHaveBeenCalledWith('instance-1', 'base64', 'scan-me');
  });
});
