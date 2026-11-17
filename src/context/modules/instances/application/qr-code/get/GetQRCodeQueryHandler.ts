import { DomainError } from '@shared/domain/error/DomainError';
import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { GetQRCodeQuery } from '@modules/instances/application/qr-code/get/GetQRCodeQuery';
import { QRCodeResponse } from '@modules/instances/application/qr-code/get/QRCodeResponse';
import { QRCodeSearcher } from '@modules/instances/application/qr-code/get/QRCodeSearcher';

export class GetQRCodeQueryHandler implements IQueryHandler<GetQRCodeQuery, QRCodeResponse> {
  constructor(private readonly useCase: QRCodeSearcher) {}

  subscribedTo(): typeof GetQRCodeQuery {
    return GetQRCodeQuery;
  }

  async handle(query: GetQRCodeQuery): Promise<QRCodeResponse> {
    try {
      const instance = await this.useCase.execute(query.instanceId);
      return QRCodeResponse.create(instance);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw error;
    }
  }
}
