import { GetQRCodeStatusQuery } from '@application/instances/qr-code/status/GetQRCodeStatusQuery';
import { QRCodeStatus } from '@application/instances/qr-code/status/QRCodeStatus';
import { QRCodeStatusResponse } from '@application/instances/qr-code/status/QRCodeStatusResponse';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

export class GetQRCodeStatusQueryHandler implements IQueryHandler<
  GetQRCodeStatusQuery,
  QRCodeStatusResponse
> {
  constructor(private readonly searcher: QRCodeStatus) {}

  subscribedTo(): typeof GetQRCodeStatusQuery {
    return GetQRCodeStatusQuery;
  }

  async handle(query: GetQRCodeStatusQuery): Promise<QRCodeStatusResponse> {
    try {
      const instance = await this.searcher.execute(query.instanceId);
      return QRCodeStatusResponse.create(instance);
    } catch (error) {
      if (error instanceof Error) {
        throw new NotFoundError('instance not found');
      }
      throw error;
    }
  }
}
