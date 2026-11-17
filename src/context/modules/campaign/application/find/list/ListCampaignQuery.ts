import { Query } from '@shared/domain/query/Query';

import { CampaignsResponse } from '@modules/campaign/application/CampaignsResponse';

export class ListCampaignQuery extends Query<CampaignsResponse> {
  constructor(
    readonly limit?: number,
    readonly skip?: number
  ) {
    super();
  }
}
