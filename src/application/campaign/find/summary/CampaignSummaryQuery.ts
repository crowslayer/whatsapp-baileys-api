import { ICampaignListItem } from '@domain/campaign/ICampaignReadRepository';

import { CampaignResponse } from '@application/campaign/CampaignResponse';

import { Query } from '@shared/domain/query/Query';

export class CampaignSummaryQuery extends Query<CampaignResponse<ICampaignListItem | null>> {
  constructor(readonly campaignId: string) {
    super();
  }
}
