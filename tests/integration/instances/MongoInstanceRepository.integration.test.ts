import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Name } from '@modules/instances/domain/Name';
import { InstanceAggregate } from '@modules/instances/domain/InstanceAggregate';
import { MongoInstanceReadRepository } from '@modules/instances/infrastructure/persistence/mongo/MongoInstanceReadRepository';
import { MongoInstanceRepository } from '@modules/instances/infrastructure/persistence/mongo/MongoInstanceRepository';

import { MongoTestDatabase } from '../support/MongoTestDatabase';

describe('MongoInstanceRepository integration', () => {
  const database = new MongoTestDatabase();

  beforeAll(async () => {
    await database.connect();
  }, 60_000);

  beforeEach(async () => {
    await database.clear();
  });

  afterAll(async () => {
    await database.disconnect();
  }, 60_000);

  it('persists an instance that can be read through the Mongo read repository', async () => {
    // Arrange
    const repository = new MongoInstanceRepository();
    const readRepository = new MongoInstanceReadRepository();
    const instance = InstanceAggregate.create({ name: Name.create('Integration instance') });

    // Act
    await repository.save(instance);
    const stored = await readRepository.findById(instance.instanceId);

    // Assert
    expect(stored).toMatchObject({
      instanceId: instance.instanceId,
      name: 'Integration instance',
      status: 'disconnected',
    });
  });
});
