import { Query } from '@shared/domain/query/Query';
import { IQueryBus } from '@shared/domain/query/QueryBus';
import { IResponse } from '@shared/domain/Response';
import { QueryHandlers } from '@shared/infrastructure/query-bus/QueryHandlers';

export class InMemoryQueryBus implements IQueryBus {
  constructor(private readonly queryHandlersInformation: QueryHandlers) {}

  ask<TResponse extends IResponse>(query: Query<TResponse>): Promise<TResponse> {
    const handler = this.queryHandlersInformation.get(query);

    return handler.handle(query);
  }
}
