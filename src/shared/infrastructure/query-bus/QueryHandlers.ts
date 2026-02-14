import { Query } from '@shared/domain/queries/Query';
import { IQueryHandler } from '@shared/domain/queries/QueryHandler';
import { QueryNotRegisteredError } from '@shared/domain/queries/QueryNotRegisteredError';
import { IResponse } from '@shared/domain/Response';

type QueryConstructor<TResponse extends IResponse> = new (...args: never[]) => Query<TResponse>;

export class QueryHandlers {
  private readonly _handlers = new Map<
    QueryConstructor<IResponse>,
    IQueryHandler<Query<IResponse>, IResponse>
  >();

  constructor(handlers: ReadonlyArray<IQueryHandler<Query<IResponse>, IResponse>>) {
    handlers.forEach((handler) => {
      this._handlers.set(handler.subscribedTo(), handler);
    });
  }

  get<TResponse extends IResponse>(
    query: Query<TResponse>
  ): IQueryHandler<Query<TResponse>, TResponse> {
    const handler = this._handlers.get(query.constructor as QueryConstructor<IResponse>);

    if (!handler) {
      throw new QueryNotRegisteredError(query);
    }

    return handler as IQueryHandler<Query<TResponse>, TResponse>;
  }
}
