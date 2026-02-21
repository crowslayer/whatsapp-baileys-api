import { IResponse } from '@shared/domain/Response';

export class QRCodeResponse implements IResponse {
  readonly content: unknown;
  protected constructor(instance: unknown) {
    this.content = instance;
  }

  static create(instance: unknown): QRCodeResponse {
    return new QRCodeResponse(instance);
  }
}
