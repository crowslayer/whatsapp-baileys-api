import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdateFlowCommandHandler } from '@modules/flows/application/update/UpdateFlowCommandHandler';
import { UpdateFlowCommand } from '@modules/flows/application/update/UpdateFlowCommand';
import type { FlowUpdater } from '@modules/flows/application/update/FlowUpdater';

describe('UpdateFlowCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('subscribes to its command and delegates handling', async () => {
    // Arrange
    const useCase = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as FlowUpdater;
    const handler = new UpdateFlowCommandHandler(useCase);
    const command = new UpdateFlowCommand('flow-1', 'instance-1', 'Flow');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(UpdateFlowCommand);
    expect(useCase.execute).toHaveBeenCalledWith(command);
  });

  it('propagates use case errors', async () => {
    // Arrange
    const failure = new Error('update failed');
    const useCase = { execute: vi.fn().mockRejectedValue(failure) } as unknown as FlowUpdater;

    // Act / Assert
    await expect(new UpdateFlowCommandHandler(useCase).handle(
      new UpdateFlowCommand('flow-1', 'instance-1', 'Flow')
    )).rejects.toBe(failure);
  });
});
