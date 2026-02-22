import { Query } from '@shared/domain/query/Query';

import { QRCodeStatusResponse } from './QRCodeStatusResponse';

export class GetQRCodeStatusQuery implements Query<QRCodeStatusResponse> {
  constructor(public readonly instanceId: string) {}
}
