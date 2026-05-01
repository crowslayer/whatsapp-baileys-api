import { CampaignResponse } from '@application/campaign/CampaignResponse';
import { CampaignProgressQuery } from '@application/campaign/find/progress/CampaignProgressQuery';
import { ProgressFinder } from '@application/campaign/find/progress/ProgressFinder';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class CampaignProgressQueryHandler implements IQueryHandler<
  CampaignProgressQuery,
  CampaignResponse<number>
> {
  constructor(private readonly finder: ProgressFinder) {}

  subscribedTo(): typeof CampaignProgressQuery {
    return CampaignProgressQuery;
  }

  async handle(query: CampaignProgressQuery): Promise<CampaignResponse<number>> {
    const total = await this.finder.execute(query.campaignId);

    return CampaignResponse.create<number>(total);
  }
}
