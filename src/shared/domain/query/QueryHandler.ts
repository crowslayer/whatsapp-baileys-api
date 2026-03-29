import { Query } from '@shared/domain/query/Query';
import { IResponse } from '@shared/domain/Response';

export interface IQueryHandler<TQuery extends Query<TResponse>, TResponse extends IResponse> {
  subscribedTo(): new (...args: never[]) => TQuery;

  handle(query: TQuery): Promise<TResponse>;
}
