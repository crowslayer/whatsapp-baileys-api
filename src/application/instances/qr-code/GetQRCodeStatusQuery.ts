import { Query } from '@shared/domain/query/Query';

import { QRCodeResponse } from './QRCodeResponse';

export class GetQRCodeStatusQuery implements Query<QRCodeResponse> {
  constructor(public readonly instanceId: string) {}
}
