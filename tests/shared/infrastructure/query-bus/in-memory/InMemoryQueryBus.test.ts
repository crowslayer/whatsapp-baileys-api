import { describe, expect, vi } from 'vitest';
import { Query } from '../../../../../src/shared/domain/query/Query';
import { IResponse } from '../../../../../src/shared/domain/Response';

class TestResponse implements IResponse {
  constructor(readonly content: unknown) {}
}

class TestQuery extends Query<TestResponse> {
  constructor(readonly id: string) {
    super();
  }
}

describe('InMemoryQueryBus', () => {
  test('should dispatch query to handler', async () => {
    const { InMemoryQueryBus } =
      await import('../../../../../src/shared/infrastructure/query-bus/in-memory/InMemoryQueryBus');
    const { QueryHandlers } =
      await import('../../../../../src/shared/infrastructure/query-bus/QueryHandlers');

    const handler = {
      subscribedTo: () => TestQuery,
      handle: vi.fn().mockResolvedValue(new TestResponse('result')),
    };
    const handlers = new QueryHandlers([handler]);
    const bus = new InMemoryQueryBus(handlers);

    const result = await bus.ask(new TestQuery('test'));
    expect(result).toBeInstanceOf(TestResponse);
    expect(result.content).toBe('result');
  });

  test('should throw for unregistered query', async () => {
    const { InMemoryQueryBus } =
      await import('../../../../../src/shared/infrastructure/query-bus/in-memory/InMemoryQueryBus');
    const { QueryHandlers } =
      await import('../../../../../src/shared/infrastructure/query-bus/QueryHandlers');

    const handlers = new QueryHandlers([]);
    const bus = new InMemoryQueryBus(handlers);

    await expect(bus.ask(new TestQuery('test'))).rejects.toThrow();
  });
});
