import { InstanceId } from '@domain/value-objects/InstanceId';

import { FindInstance } from '@application/instances/get/FindInstance';
import { GetInstanceQuery } from '@application/instances/get/GetInstanceQuery';
import { InstanceResponse } from '@application/instances/InstanceResponse';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

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
