import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateInstanceCommandHandler } from '@modules/instances/application/create/CreateInstanceCommandHandler';
import { CreateInstanceCommand } from '@modules/instances/application/create/CreateInstanceCommand';
import { InstancesCreator } from '@modules/instances/application/create/InstancesCreator';

describe('CreateInstanceCommandHandler', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates instance creation to the use case', async () => {
    // Arrange
    const creator = { execute: vi.fn().mockResolvedValue(undefined) } as unknown as InstancesCreator;
    const handler = new CreateInstanceCommandHandler(creator);
    const command = new CreateInstanceCommand('Support');

    // Act
    await handler.handle(command);

    // Assert
    expect(handler.subscribedTo()).toBe(CreateInstanceCommand);
    expect(creator.execute).toHaveBeenCalledWith(command);
  });
});
