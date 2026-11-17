import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NotifyInstanceConnected } from '@modules/instances/application/connect/NotifyInstanceConnected';
import type { IInstanceRepository } from '@modules/instances/domain/IInstanceRepository';

describe('NotifyInstanceConnected', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('updates and persists a found instance', async () => {
    // Arrange
    const instance = { connect: vi.fn() };
    const repository = { findById: vi.fn().mockResolvedValue(instance), save: vi.fn().mockResolvedValue(undefined) } as unknown as IInstanceRepository;
    const useCase = new NotifyInstanceConnected(repository);

    // Act
    await useCase.execute({ instanceId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', phoneNumber: '5215555555555' });

    // Assert
    expect(instance.connect).toHaveBeenCalledWith('5215555555555');
    expect(repository.save).toHaveBeenCalledWith(instance);
  });

  it('rejects an unknown instance', async () => {
    // Arrange
    const repository = { findById: vi.fn().mockResolvedValue(null) } as unknown as IInstanceRepository;
    const useCase = new NotifyInstanceConnected(repository);

    // Act & Assert
    await expect(useCase.execute({ instanceId: '0198f0f7-2a3b-7c4d-8e5f-6a7b8c9d0e2f', phoneNumber: '5215555555555' })).rejects.toThrow('Instance not found');
  });
});
