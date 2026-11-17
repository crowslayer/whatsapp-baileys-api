import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DisconnectInstanceCommandHandler } from '@modules/instances/application/disconnect/DisconnectInstanceCommandHandler';
import { DisconnectInstanceCommand } from '@modules/instances/application/disconnect/DisconnectInstanceCommand';
import { InstancesDisconnect } from '@modules/instances/application/disconnect/InstancesDisconnect';

describe('DisconnectInstanceCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates the disconnection command', async () => {
    // Arrange
    const disconnect = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as InstancesDisconnect;
    const handler = new DisconnectInstanceCommandHandler(disconnect);
    const command = new DisconnectInstanceCommand('instance-1');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(DisconnectInstanceCommand);
    expect(disconnect.execute).toHaveBeenCalledWith(command);
  });
});
