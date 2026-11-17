import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryQueryBus } from '@shared/infrastructure/query-bus/in-memory/InMemoryQueryBus';
import type { QueryHandlers } from '@shared/infrastructure/query-bus/QueryHandlers';
import type { Query } from '@shared/domain/query/Query';
import type { IResponse } from '@shared/domain/Response';

describe('InMemoryQueryBus', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('delegates a query to its registered handler', async () => {
    // Arrange
    const query = { kind: 'query' } as Query<IResponse>;
    const response = { content: { value: 1 } } as IResponse;
    const handler = { handle: vi.fn().mockResolvedValue(response) };
    const handlers = { get: vi.fn().mockReturnValue(handler) } as unknown as QueryHandlers;
    const bus = new InMemoryQueryBus(handlers);

    // Act
    const result = await bus.ask(query);

    // Assert
    expect(handlers.get).toHaveBeenCalledWith(query);
    expect(handler.handle).toHaveBeenCalledWith(query);
    expect(result).toBe(response);
  });

  it('rejects when handler lookup throws', async () => {
    // Arrange
    const query = { kind: 'query' } as Query<IResponse>;
    const handlers = { get: vi.fn(() => { throw new Error('not registered'); }) } as unknown as QueryHandlers;
    const bus = new InMemoryQueryBus(handlers);

    // Act & Assert
    await expect(bus.ask(query)).rejects.toThrow('not registered');
  });
});
