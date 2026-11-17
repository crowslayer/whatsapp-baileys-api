import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstancesDisconnect } from '@modules/instances/application/disconnect/InstancesDisconnect';
import { DisconnectInstanceCommand } from '@modules/instances/application/disconnect/DisconnectInstanceCommand';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('InstancesDisconnect', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('stops the requested runtime', async () => {
    // Arrange
    const manager = { stop: vi.fn().mockResolvedValue(undefined) } as unknown as IRuntimeManager;
    const disconnect = new InstancesDisconnect(manager);
    const command = new DisconnectInstanceCommand('instance-1');

    // Act
    await disconnect.execute(command);

    // Assert
    expect(manager.stop).toHaveBeenCalledWith('instance-1');
  });
});
