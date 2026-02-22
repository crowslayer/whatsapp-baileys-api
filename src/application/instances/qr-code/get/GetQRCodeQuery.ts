import { Query } from '@shared/domain/query/Query';

import { QRCodeResponse } from './QRCodeResponse';

export class GetQRCodeQuery implements Query<QRCodeResponse> {
  constructor(public readonly instanceId: string) {}
}
