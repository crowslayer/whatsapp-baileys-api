import { CampaignsResponse } from '@application/campaign/CampaignsResponse';
import { CampaignFinder } from '@application/campaign/find/list/CampaignFinder';
import { ListCampaignQuery } from '@application/campaign/find/list/ListCampaignQuery';

import { IQueryHandler } from '@shared/domain/query/QueryHandler';

export class ListCampaignQueryHandler implements IQueryHandler<
  ListCampaignQuery,
  CampaignsResponse
> {
  constructor(private readonly finder: CampaignFinder) {}

  subscribedTo(): typeof ListCampaignQuery {
    return ListCampaignQuery;
  }

  async handle(query: ListCampaignQuery): Promise<CampaignsResponse> {
    const campaigns = await this.finder.execute(query.limit, query.skip);

    return CampaignsResponse.create(campaigns);
  }
}
