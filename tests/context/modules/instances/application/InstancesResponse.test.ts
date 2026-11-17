import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstancesResponse } from '@modules/instances/application/InstancesResponse';
import type { InstanceReadModel } from '@modules/instances/domain/IInstanceReadRepository';

describe('InstancesResponse', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps instance read models', () => {
    // Arrange
    const instances: InstanceReadModel[] = [{
      instanceId: 'instance-1', name: 'Primary', status: 'connected',
      createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    }];

    // Act
    const response = InstancesResponse.create(instances);

    // Assert
    expect(response.content).toBe(instances);
  });

  it('creates an empty response', () => {
    // Arrange / Act
    const response = InstancesResponse.none();

    // Assert
    expect(response.content).toEqual([]);
  });
});
