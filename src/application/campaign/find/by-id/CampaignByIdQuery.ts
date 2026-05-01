import { ICampaignItem } from '@domain/campaign/ICampaignReadRepository';

import { CampaignResponse } from '@application/campaign/CampaignResponse';

import { Query } from '@shared/domain/query/Query';

export class CampaignByIdQuery extends Query<CampaignResponse<ICampaignItem | null>> {
  constructor(readonly campaignId: string) {
    super();
  }
}
