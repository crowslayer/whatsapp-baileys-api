import { DomainError } from '@shared/domain/error/DomainError';
import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { GetQRCodeStatusQuery } from '@modules/instances/application/qr-code/status/GetQRCodeStatusQuery';
import { QRCodeStatus } from '@modules/instances/application/qr-code/status/QRCodeStatus';
import { QRCodeStatusResponse } from '@modules/instances/application/qr-code/status/QRCodeStatusResponse';

export class GetQRCodeStatusQueryHandler implements IQueryHandler<
  GetQRCodeStatusQuery,
  QRCodeStatusResponse
> {
  constructor(private readonly useCase: QRCodeStatus) {}

  subscribedTo(): typeof GetQRCodeStatusQuery {
    return GetQRCodeStatusQuery;
  }

  async handle(query: GetQRCodeStatusQuery): Promise<QRCodeStatusResponse> {
    try {
      const instance = await this.useCase.execute(query.instanceId);
      return QRCodeStatusResponse.create(instance);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw error;
    }
  }
}
