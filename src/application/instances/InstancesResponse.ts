import { WhatsAppInstance } from '@domain/queries/IWhatsAppInstanceReadRepository';

import { IResponse } from '@shared/domain/Response';

export class InstancesResponse implements IResponse {
  readonly content: WhatsAppInstance[];
  protected constructor(instances: WhatsAppInstance[]) {
    this.content = instances;
  }

  static create(instances: WhatsAppInstance[]): InstancesResponse {
    return new InstancesResponse(instances);
  }

  static none(): InstancesResponse {
    return new InstancesResponse([]);
  }
}
