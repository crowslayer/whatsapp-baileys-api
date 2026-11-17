import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InstanceResponse } from '@modules/instances/application/InstanceResponse';
import type { InstanceReadModel } from '@modules/instances/domain/IInstanceReadRepository';

describe('InstanceResponse', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('wraps a single instance read model', () => {
    // Arrange
    const instance: InstanceReadModel = {
      instanceId: 'instance-1', name: 'Primary', status: 'connected',
      createdAt: new Date('2025-01-01T00:00:00.000Z'), updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    // Act
    const response = InstanceResponse.create(instance);

    // Assert
    expect(response.content).toBe(instance);
  });
});
