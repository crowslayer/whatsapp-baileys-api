import { Query } from '@shared/domain/query/Query';

import { QRCodeStatusResponse } from '@modules/instances/application/qr-code/status/QRCodeStatusResponse';

export class GetQRCodeStatusQuery implements Query<QRCodeStatusResponse> {
  constructor(public readonly instanceId: string) {}
}
