import { Query } from '@shared/domain/query/Query';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';

export class CampaignProgressQuery extends Query<CampaignResponse<number>> {
  constructor(readonly campaignId: string) {
    super();
  }
}
