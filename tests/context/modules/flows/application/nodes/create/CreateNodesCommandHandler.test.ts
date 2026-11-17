import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateNodesCommandHandler } from '@modules/flows/application/nodes/create/CreateNodesCommandHandler';
import { CreateNodesCommand } from '@modules/flows/application/nodes/create/CreateNodesCommand';
import type { NodesCreator } from '@modules/flows/application/nodes/create/NodesCreator';

describe('CreateNodesCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('subscribes to the create nodes command and delegates execution', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as NodesCreator;
    const handler = new CreateNodesCommandHandler(useCase);
    const command = new CreateNodesCommand('flow-1', {}, '', []);

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(CreateNodesCommand);
    expect(useCase.execute).toHaveBeenCalledWith(command);
  });
});
