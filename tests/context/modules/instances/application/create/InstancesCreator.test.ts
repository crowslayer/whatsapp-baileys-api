import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstancesCreator } from '@modules/instances/application/create/InstancesCreator';
import { CreateInstanceCommand } from '@modules/instances/application/create/CreateInstanceCommand';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';

describe('InstancesCreator', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('creates and persists an instance', async () => {
    // Arrange
    const repository = { save: vi.fn().mockResolvedValue(undefined) } as unknown as IInstanceRepository;
    const creator = new InstancesCreator(repository);
    const command = new CreateInstanceCommand('Support', 'https://example.test/hook', false, '5215555555555');

    // Act
    await creator.execute(command);

    // Assert
    expect(repository.save).toHaveBeenCalledOnce();
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ webhookUrl: command.webhookUrl }));
  });
});
