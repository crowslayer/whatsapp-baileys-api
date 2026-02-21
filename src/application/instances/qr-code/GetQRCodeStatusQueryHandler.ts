import { IQueryHandler } from '@shared/domain/query/QueryHandler';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';

import { GetQRCodeStatusQuery } from './GetQRCodeStatusQuery';
import { QRCodeResponse } from './QRCodeResponse';
import { QRCodeStatus } from './QRCodeStatus';

export class GetQRCodeStatusQueryHandler implements IQueryHandler<
  GetQRCodeStatusQuery,
  QRCodeResponse
> {
  constructor(private readonly searcher: QRCodeStatus) {}

  subscribedTo(): typeof GetQRCodeStatusQuery {
    return GetQRCodeStatusQuery;
  }

  async handle(query: GetQRCodeStatusQuery): Promise<QRCodeResponse> {
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
