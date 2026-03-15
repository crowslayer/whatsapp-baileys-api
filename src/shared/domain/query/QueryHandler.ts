import { IResponse } from '../Response';

import { Query } from './Query';

export interface IQueryHandler<TQuery extends Query<TResponse>, TResponse extends IResponse> {
  subscribedTo(): new (...args: never[]) => TQuery;

  handle(query: TQuery): Promise<TResponse>;
}
