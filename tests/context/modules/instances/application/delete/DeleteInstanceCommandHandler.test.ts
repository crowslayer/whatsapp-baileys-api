import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteInstanceCommandHandler } from '@modules/instances/application/delete/DeleteInstanceCommandHandler';
import { DeleteInstanceCommand } from '@modules/instances/application/delete/DeleteInstanceCommand';
import { InstancesEraser } from '@modules/instances/application/delete/InstancesEraser';

describe('DeleteInstanceCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates the delete command', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as InstancesEraser;
    const handler = new DeleteInstanceCommandHandler(useCase);
    const command = new DeleteInstanceCommand('instance-id');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(DeleteInstanceCommand);
    expect(useCase.execute).toHaveBeenCalledWith(command);
  });
});
