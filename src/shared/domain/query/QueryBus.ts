import { IResponse } from '../Response';

import { Query } from './Query';

export interface IQueryBus {
  ask<TResponse extends IResponse>(query: Query<TResponse>): Promise<TResponse>;
}
