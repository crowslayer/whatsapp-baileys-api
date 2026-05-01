import { ICampaignStats } from '@domain/campaign/ICampaignReadRepository';

import { CampaignResponse } from '@application/campaign/CampaignResponse';
import { CampaignStatsQuery } from '@application/campaign/find/stats/CampaignStatsQuery';
import { StatsFinder } from '@application/campaign/find/stats/StatsFinder';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class CampaignStatsQueryHandler implements IQueryHandler<
  CampaignStatsQuery,
  CampaignResponse<ICampaignStats>
> {
  constructor(private readonly finder: StatsFinder) {}

  subscribedTo(): typeof CampaignStatsQuery {
    return CampaignStatsQuery;
  }

  async handle(_query: CampaignStatsQuery): Promise<CampaignResponse<ICampaignStats>> {
    const stats = await this.finder.execute();
    return CampaignResponse.create<ICampaignStats>(stats);
  }
}
