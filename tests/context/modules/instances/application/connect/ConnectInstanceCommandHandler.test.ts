import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConnectInstanceCommandHandler } from '@modules/instances/application/connect/ConnectInstanceCommandHandler';
import { ConnectInstanceCommand } from '@modules/instances/application/connect/ConnectInstanceCommand';
import { InstancesConnect } from '@modules/instances/application/connect/InstancesConnect';

describe('ConnectInstanceCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates the connection command', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as InstancesConnect;
    const handler = new ConnectInstanceCommandHandler(useCase);
    const command = new ConnectInstanceCommand('instance-1');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(ConnectInstanceCommand);
    expect(useCase.execute).toHaveBeenCalledWith(command);
  });
});
