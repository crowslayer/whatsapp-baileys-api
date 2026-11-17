import { Query } from '@shared/domain/query/Query';
import { IResponse } from '@shared/domain/Response';

export interface IQueryBus {
  ask<TResponse extends IResponse>(query: Query<TResponse>): Promise<TResponse>;
}
