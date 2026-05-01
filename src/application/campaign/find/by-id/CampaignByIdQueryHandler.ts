import { ICampaignItem } from '@domain/campaign/ICampaignReadRepository';

import { CampaignResponse } from '@application/campaign/CampaignResponse';
import { CampaignByIdQuery } from '@application/campaign/find/by-id/CampaignByIdQuery';
import { CampaignFinderById } from '@application/campaign/find/by-id/CampaignFinderById';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class CampaignByIdQueryHandler implements IQueryHandler<
  CampaignByIdQuery,
  CampaignResponse<ICampaignItem | null>
> {
  constructor(private readonly finder: CampaignFinderById) {}

  subscribedTo(): typeof CampaignByIdQuery {
    return CampaignByIdQuery;
  }

  async handle(query: CampaignByIdQuery): Promise<CampaignResponse<ICampaignItem | null>> {
    const document = await this.finder.execute(query.campaignId);
    return CampaignResponse.create(document);
  }
}
