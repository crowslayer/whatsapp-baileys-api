import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { GetQRCodeStatusQuery } from './GetQRCodeStatusQuery';
import { QRCodeStatus } from './QRCodeStatus';
import { QRCodeStatusResponse } from './QRCodeStatusResponse';

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
