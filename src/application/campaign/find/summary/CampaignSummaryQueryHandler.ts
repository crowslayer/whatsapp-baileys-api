import { ICampaignListItem } from '@domain/campaign/ICampaignReadRepository';

import { CampaignResponse } from '@application/campaign/CampaignResponse';
import { CampaignSummaryQuery } from '@application/campaign/find/summary/CampaignSummaryQuery';
import { SummaryFinder } from '@application/campaign/find/summary/SummaryFinder';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class CampaignSummaryQueryHandler implements IQueryHandler<
  CampaignSummaryQuery,
  CampaignResponse<ICampaignListItem | null>
> {
  constructor(private readonly finder: SummaryFinder) {}

  subscribedTo(): typeof CampaignSummaryQuery {
    return CampaignSummaryQuery;
  }

  async handle(query: CampaignSummaryQuery): Promise<CampaignResponse<ICampaignListItem | null>> {
    const item = await this.finder.execute(query.campaignId);
    return CampaignResponse.create<ICampaignListItem | null>(item);
  }
}
