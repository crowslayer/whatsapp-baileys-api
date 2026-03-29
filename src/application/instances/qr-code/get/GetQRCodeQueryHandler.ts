import { GetQRCodeQuery } from '@application/instances/qr-code/get/GetQRCodeQuery';
import { QRCodeResponse } from '@application/instances/qr-code/get/QRCodeResponse';
import { QRCodeSearcher } from '@application/instances/qr-code/get/QRCodeSearcher';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

export class GetQRCodeQueryHandler implements IQueryHandler<GetQRCodeQuery, QRCodeResponse> {
  constructor(private readonly searcher: QRCodeSearcher) {}

  subscribedTo(): typeof GetQRCodeQuery {
    return GetQRCodeQuery;
  }

  async handle(query: GetQRCodeQuery): Promise<QRCodeResponse> {
    try {
      const instance = await this.searcher.execute(query.instanceId);
      return QRCodeResponse.create(instance);
    } catch (error) {
      if (error instanceof Error) {
        throw new NotFoundError('instance not found');
      }
      throw error;
    }
  }
}
