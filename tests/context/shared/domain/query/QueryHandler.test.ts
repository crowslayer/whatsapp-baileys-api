import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IResponse } from '@shared/domain/Response';
import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { Query } from '@shared/domain/query/Query';

interface UserContent extends IResponse {
  content: { id: string };
}

class GetUserQuery extends Query<UserContent> {}

class GetUserHandler implements IQueryHandler<GetUserQuery, UserContent> {
  subscribedTo(): new (...args: never[]) => GetUserQuery {
    return GetUserQuery;
  }

  handle(query: GetUserQuery): Promise<UserContent> {
    return Promise.resolve({ content: { id: `user-${query instanceof GetUserQuery}` } });
  }
}

class FailingHandler implements IQueryHandler<GetUserQuery, UserContent> {
  subscribedTo(): new (...args: never[]) => GetUserQuery {
    return GetUserQuery;
  }

  handle(query: GetUserQuery): Promise<UserContent> {
    return Promise.reject(new Error(`query failed for ${query.constructor.name}`));
  }
}

describe('IQueryHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the query class it is subscribed to', () => {
    const handler = new GetUserHandler();

    expect(handler.subscribedTo()).toBe(GetUserQuery);
  });

  it('creates a new instance of the subscribed query', () => {
    const handler = new GetUserHandler();
    const QueryClass = handler.subscribedTo();
    const query = new QueryClass();

    expect(query).toBeInstanceOf(GetUserQuery);
  });

  it('resolves with the response produced by the handler', async () => {
    const handler = new GetUserHandler();

    const result = await handler.handle(new GetUserQuery());

    expect(result).toEqual({ content: { id: 'user-true' } });
  });

  it('rejects when the handler fails', async () => {
    const handler = new FailingHandler();

    await expect(handler.handle(new GetUserQuery())).rejects.toThrow('query failed');
  });
});
