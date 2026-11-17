import { Query } from '@shared/domain/query/Query';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';
import { CampaignReadModel } from '@modules/campaign/domain/ICampaignReadRepository';

export class CampaignByIdQuery extends Query<CampaignResponse<CampaignReadModel | null>> {
  constructor(readonly campaignId: string) {
    super();
  }
}
