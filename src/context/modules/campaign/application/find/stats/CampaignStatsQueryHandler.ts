import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';
import { CampaignStatsQuery } from '@modules/campaign/application/find/stats/CampaignStatsQuery';
import { StatsFinder } from '@modules/campaign/application/find/stats/StatsFinder';
import { CampaignStats } from '@modules/campaign/domain/ICampaignReadRepository';

export class CampaignStatsQueryHandler implements IQueryHandler<
  CampaignStatsQuery,
  CampaignResponse<CampaignStats>
> {
  constructor(private readonly useCase: StatsFinder) {}

  subscribedTo(): typeof CampaignStatsQuery {
    return CampaignStatsQuery;
  }

  async handle(_query: CampaignStatsQuery): Promise<CampaignResponse<CampaignStats>> {
    const stats = await this.useCase.execute();
    return CampaignResponse.create<CampaignStats>(stats);
  }
}
