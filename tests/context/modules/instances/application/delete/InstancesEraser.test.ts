import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstancesEraser } from '@modules/instances/application/delete/InstancesEraser';
import { DeleteInstanceCommand } from '@modules/instances/application/delete/DeleteInstanceCommand';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';
import type { IRuntimeManager } from '@shared/domain/whatsapp/IRuntimeManager';

describe('InstancesEraser', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('deletes the persisted instance and stops its runtime', async () => {
    // Arrange
    const repository = { delete: vi.fn().mockResolvedValue(undefined) } as unknown as IInstanceRepository;
    const runtime = { stop: vi.fn().mockResolvedValue(undefined) } as unknown as IRuntimeManager;
    const eraser = new InstancesEraser(repository, runtime);
    const command = new DeleteInstanceCommand('0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f');

    // Act
    await eraser.execute(command);

    // Assert
    expect(repository.delete).toHaveBeenCalledOnce();
    expect(runtime.stop).toHaveBeenCalledWith(command.instanceId);
  });
});
