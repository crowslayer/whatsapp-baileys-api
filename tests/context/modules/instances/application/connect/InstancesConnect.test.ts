import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstancesConnect } from '@modules/instances/application/connect/InstancesConnect';
import { ConnectInstanceCommand } from '@modules/instances/application/connect/ConnectInstanceCommand';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('InstancesConnect', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('starts with a phone number when pairing code is requested', async () => {
    // Arrange
    const manager = { start: vi.fn().mockResolvedValue(undefined) } as unknown as IRuntimeManager;
    const connect = new InstancesConnect(manager);
    const command = new ConnectInstanceCommand('instance-1', true, '+5215555555555');

    // Act
    await connect.execute(command);

    // Assert
    expect(manager.start).toHaveBeenCalledWith('instance-1', '+5215555555555');
  });

  it('starts without a phone number for QR pairing', async () => {
    // Arrange
    const manager = { start: vi.fn().mockResolvedValue(undefined) } as unknown as IRuntimeManager;
    const connect = new InstancesConnect(manager);

    // Act
    await connect.execute(new ConnectInstanceCommand('instance-2'));

    // Assert
    expect(manager.start).toHaveBeenCalledWith('instance-2');
  });
});
