import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Query } from '@shared/domain/query/Query';
import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { IResponse } from '@shared/domain/Response';
import { QueryHandlers } from '@shared/infrastructure/query-bus/QueryHandlers';
import { QueryNotRegisteredError } from '@shared/infrastructure/query-bus/QueryNotRegisteredError';

interface UserResponse extends IResponse {
  id: string;
}

class GetUserQuery extends Query<UserResponse> {}
class ListUsersQuery extends Query<IResponse> {}

type AnyQueryConstructor = new (...args: never[]) => Query<IResponse>;

function createHandler(
  subscribedTo: AnyQueryConstructor,
  handle: IQueryHandler<Query<IResponse>, IResponse>['handle']
): IQueryHandler<Query<IResponse>, IResponse> {
  return {
    subscribedTo: () => subscribedTo,
    handle,
  };
}

describe('QueryHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the handler registered for the query', () => {
    const handle = vi.fn().mockResolvedValue({ id: 'user-1' });
    const handler = createHandler(GetUserQuery, handle);
    const handlers = new QueryHandlers([handler]);

    const result = handlers.get(new GetUserQuery());

    expect(result).toBe(handler);
  });

  it('throws when the query has no registered handler', () => {
    const handlers = new QueryHandlers([]);

    expect(() => handlers.get(new GetUserQuery())).toThrow(QueryNotRegisteredError);
  });

  it('includes the query name in the error message', () => {
    const handlers = new QueryHandlers([]);

    expect(() => handlers.get(new ListUsersQuery())).toThrow();
  });

  it('keeps only the last handler registered for the same query', () => {
    const first = createHandler(GetUserQuery, vi.fn().mockResolvedValue({ id: 'first' }));
    const second = createHandler(GetUserQuery, vi.fn().mockResolvedValue({ id: 'second' }));
    const handlers = new QueryHandlers([first, second]);

    const result = handlers.get(new GetUserQuery());

    expect(result).toBe(second);
  });

  it('resolves the handler by the exact query class', () => {
    const handler = createHandler(GetUserQuery, vi.fn().mockResolvedValue({ id: 'user-1' }));
    const handlers = new QueryHandlers([handler]);

    expect(() => handlers.get(new ListUsersQuery())).toThrow(QueryNotRegisteredError);
  });
});
