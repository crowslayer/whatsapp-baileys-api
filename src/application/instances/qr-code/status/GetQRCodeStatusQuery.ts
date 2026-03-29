import { QRCodeStatusResponse } from '@application/instances/qr-code/status/QRCodeStatusResponse';

import { Query } from '@shared/domain/query/Query';

export class GetQRCodeStatusQuery implements Query<QRCodeStatusResponse> {
  constructor(public readonly instanceId: string) {}
}
