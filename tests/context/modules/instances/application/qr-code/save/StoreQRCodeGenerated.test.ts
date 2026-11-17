import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StoreQRCodeGenerated } from '@modules/instances/application/qr-code/save/StoreQRCodeGenerated';
import { QRCodePersist } from '@modules/instances/application/qr-code/save/QRCodePersist';
import { QRCodeGeneratedEvent } from '@modules/instances/domain/events/QRCodeGeneratedEvent';

describe('StoreQRCodeGenerated', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('persists QR data carried by the event', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as QRCodePersist;
    const subscriber = new StoreQRCodeGenerated(useCase);
    const event = QRCodeGeneratedEvent.create({
      eventId: 'event-1', aggregateId: 'instance-1',
      payload: { instanceId: 'instance-1', qrCode: 'base64', qrText: 'scan-me' },
    });

    // Act
    await subscriber.on(event);

    // Assert
    expect(subscriber.subscribedTo()).toEqual([QRCodeGeneratedEvent]);
    expect(useCase.execute).toHaveBeenCalledWith(event.payload);
  });
});
