import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QRCodeStatus } from '@modules/instances/application/qr-code/status/QRCodeStatus';
import type { IInstanceReadRepository } from '@modules/instances/domain/IInstanceReadRepository';
import type { IConnectionStateStore } from '@modules/instances/application/runtime/IConnectionStateStore';

describe('QRCodeStatus', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('reports QR state and connection status', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue({ status: 'connected', phoneNumber: '5215555555555' }) } as unknown as IInstanceReadRepository;
    const stateStore = { get: vi.fn().mockResolvedValue({ status: 'connected', qr: { base64: 'base64', text: 'qr' } }) } as unknown as IConnectionStateStore;
    const status = new QRCodeStatus(repository, stateStore);

    // Act
    const result = await status.execute('instance-1');

    // Assert
    expect(result).toMatchObject({ status: 'connected', qrCode: 'base64', qrText: 'qr', qrStatus: 'ready', connected: true });
  });

  it('rejects a missing instance', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue(null) } as unknown as IInstanceReadRepository;
    const status = new QRCodeStatus(repository, { get: vi.fn() } as unknown as IConnectionStateStore);

    // Act & Assert
    await expect(status.execute('missing')).rejects.toThrow('Instance not found');
  });
});
