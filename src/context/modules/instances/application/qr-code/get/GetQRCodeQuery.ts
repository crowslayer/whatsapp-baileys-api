import { Query } from '@shared/domain/query/Query';

import { QRCodeResponse } from '@modules/instances/application/qr-code/get/QRCodeResponse';

export class GetQRCodeQuery implements Query<QRCodeResponse> {
  constructor(public readonly instanceId: string) {}
}
