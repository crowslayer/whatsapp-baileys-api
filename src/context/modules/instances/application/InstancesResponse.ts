import { IResponse } from '@shared/domain/Response';

import { InstanceReadModel } from '@modules/instances/domain/IInstanceReadRepository';

export class InstancesResponse implements IResponse {
  readonly content: InstanceReadModel[];
  protected constructor(instances: InstanceReadModel[]) {
    this.content = instances;
  }

  static create(instances: InstanceReadModel[]): InstancesResponse {
    return new InstancesResponse(instances);
  }

  static none(): InstancesResponse {
    return new InstancesResponse([]);
  }
}
