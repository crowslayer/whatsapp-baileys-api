import { IResponse } from '@shared/domain/Response';

import { InstanceReadModel } from '@modules/instances/domain/IInstanceReadRepository';

export class InstanceResponse implements IResponse {
  protected constructor(readonly content: InstanceReadModel) {}

  static create(instance: InstanceReadModel): InstanceResponse {
    return new InstanceResponse(instance);
  }
}
