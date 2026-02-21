import { WhatsAppInstance } from '@domain/queries/IWhatsAppInstanceReadRepository';

import { IResponse } from '@shared/domain/Response';

export class InstanceResponse implements IResponse {
  readonly content: WhatsAppInstance;
  protected constructor(instance: WhatsAppInstance) {
    this.content = instance;
  }

  static create(instance: WhatsAppInstance): InstanceResponse {
    return new InstanceResponse(instance);
  }
}
