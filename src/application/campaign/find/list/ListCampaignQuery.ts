import { CampaignsResponse } from '@application/campaign/CampaignsResponse';

import { Query } from '@shared/domain/query/Query';

export class ListCampaignQuery extends Query<CampaignsResponse> {
  constructor(
    readonly limit?: number,
    readonly skip?: number
  ) {
    super();
  }
}
