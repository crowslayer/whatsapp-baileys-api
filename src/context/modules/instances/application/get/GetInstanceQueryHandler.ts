import { DomainError } from '@shared/domain/error/DomainError';
import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { FindInstance } from '@modules/instances/application/get/FindInstance';
import { GetInstanceQuery } from '@modules/instances/application/get/GetInstanceQuery';
import { InstanceResponse } from '@modules/instances/application/InstanceResponse';
import { InstanceNotFoundError } from '@modules/instances/domain/InstanceNotFoundError';

export class GetInstanceQueryHandler implements IQueryHandler<GetInstanceQuery, InstanceResponse> {
  constructor(private readonly useCase: FindInstance) {}
  subscribedTo(): typeof GetInstanceQuery {
    return GetInstanceQuery;
  }

  async handle(query: GetInstanceQuery): Promise<InstanceResponse> {
    try {
      const instance = await this.useCase.execute(query.instanceId);
      if (!instance) {
        throw new InstanceNotFoundError('Instance not found');
      }
      return InstanceResponse.create(instance);
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw error;
    }
  }
}
