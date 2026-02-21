import { InstanceId } from '@domain/value-objects/InstanceId';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { InstanceResponse } from '../InstanceResponse';

import { FindInstance } from './FindInstance';
import { GetInstanceQuery } from './GetInstanceQuery';

export class GetInstanceQueryHandler implements IQueryHandler<GetInstanceQuery, InstanceResponse> {
  constructor(private readonly finder: FindInstance) {}
  subscribedTo(): typeof GetInstanceQuery {
    return GetInstanceQuery;
  }

  async handle(query: GetInstanceQuery): Promise<InstanceResponse> {
    try {
      const instanceId = InstanceId.fromString(query.instanceId);
      const instance = await this.finder.execute(instanceId);

      return InstanceResponse.create(instance);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  }
}
