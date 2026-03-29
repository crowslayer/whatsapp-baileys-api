import { QRCodeResponse } from '@application/instances/qr-code/get/QRCodeResponse';

import { Query } from '@shared/domain/query/Query';

export class GetQRCodeQuery implements Query<QRCodeResponse> {
  constructor(public readonly instanceId: string) {}
}
