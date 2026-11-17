import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IResponse } from '@shared/domain/Response';
import { Query } from '@shared/domain/query/Query';

interface UserContent extends IResponse {
  content: { id: string };
}

class GetUserQuery extends Query<UserContent> {}

class GetEmptyQuery extends Query<IResponse> {}

describe('Query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('can be instantiated by a concrete query', () => {
    const query = new GetUserQuery();

    expect(query).toBeInstanceOf(GetUserQuery);
    expect(query).toBeInstanceOf(Query);
  });

  it('supports a query without a concrete response payload', () => {
    const query = new GetEmptyQuery();

    expect(query).toBeInstanceOf(Query);
  });

  it('creates independent instances', () => {
    const first = new GetUserQuery();
    const second = new GetUserQuery();

    expect(first).not.toBe(second);
  });
});
