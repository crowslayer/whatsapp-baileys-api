import { CampaignResponse } from '@application/campaign/CampaignResponse';

import { Query } from '@shared/domain/query/Query';

export class CampaignProgressQuery extends Query<CampaignResponse<number>> {
  constructor(readonly campaignId: string) {
    super();
  }
}
