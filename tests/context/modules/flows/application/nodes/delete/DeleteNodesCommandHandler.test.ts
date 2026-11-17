import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteNodesCommandHandler } from '@modules/flows/application/nodes/delete/DeleteNodesCommandHandler';
import { DeleteNodesCommand } from '@modules/flows/application/nodes/delete/DeleteNodesCommand';
import type { NodesEraser } from '@modules/flows/application/nodes/delete/NodesEraser';

describe('DeleteNodesCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates the command flow id to the eraser', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as NodesEraser;
    const handler = new DeleteNodesCommandHandler(useCase);
    const command = new DeleteNodesCommand('flow-1');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(DeleteNodesCommand);
    expect(useCase.execute).toHaveBeenCalledWith('flow-1');
  });
});
