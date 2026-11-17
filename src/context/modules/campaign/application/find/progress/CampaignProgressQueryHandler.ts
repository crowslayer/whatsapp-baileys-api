import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';
import { CampaignProgressQuery } from '@modules/campaign/application/find/progress/CampaignProgressQuery';
import { ProgressFinder } from '@modules/campaign/application/find/progress/ProgressFinder';

export class CampaignProgressQueryHandler implements IQueryHandler<
  CampaignProgressQuery,
  CampaignResponse<number>
> {
  constructor(private readonly useCase: ProgressFinder) {}

  subscribedTo(): typeof CampaignProgressQuery {
    return CampaignProgressQuery;
  }

  async handle(query: CampaignProgressQuery): Promise<CampaignResponse<number>> {
    const total = await this.useCase.execute(query.campaignId);

    return CampaignResponse.create<number>(total);
  }
}
