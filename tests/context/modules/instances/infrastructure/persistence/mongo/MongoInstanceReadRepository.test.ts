import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MongoInstanceReadRepository } from '@modules/instances/infrastructure/persistence/mongo/MongoInstanceReadRepository';
import { WhatsAppInstanceModel } from '@modules/instances/infrastructure/persistence/mongo/WhatsAppInstanceModel';

describe('MongoInstanceReadRepository', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('loads a lean instance read model by id', async () => {
    // Arrange
    const document = { instanceId: 'instance-1', name: 'Primary', status: 'connected' };
    const exec = vi.fn().mockResolvedValue(document);
    const lean = vi.fn().mockReturnValue({ exec });
    vi.spyOn(WhatsAppInstanceModel, 'findOne').mockReturnValue({ lean } as never);
    const repository = new MongoInstanceReadRepository();

    // Act
    const result = await repository.findById('instance-1');

    // Assert
    expect(WhatsAppInstanceModel.findOne).toHaveBeenCalledWith({ instanceId: 'instance-1' });
    expect(result).toBe(document);
  });

  it('reports whether an instance exists', async () => {
    // Arrange
    const exec = vi.fn().mockResolvedValue(1);
    vi.spyOn(WhatsAppInstanceModel, 'countDocuments').mockReturnValue({ exec } as never);
    const repository = new MongoInstanceReadRepository();

    // Act
    const exists = await repository.exists('instance-1');

    // Assert
    expect(exists).toBe(true);
  });
});
