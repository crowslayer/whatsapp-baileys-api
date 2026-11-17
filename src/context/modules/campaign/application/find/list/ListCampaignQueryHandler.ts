import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { CampaignsResponse } from '@modules/campaign/application/CampaignsResponse';
import { CampaignFinder } from '@modules/campaign/application/find/list/CampaignFinder';
import { ListCampaignQuery } from '@modules/campaign/application/find/list/ListCampaignQuery';

export class ListCampaignQueryHandler implements IQueryHandler<
  ListCampaignQuery,
  CampaignsResponse
> {
  constructor(private readonly useCase: CampaignFinder) {}

  subscribedTo(): typeof ListCampaignQuery {
    return ListCampaignQuery;
  }

  async handle(query: ListCampaignQuery): Promise<CampaignsResponse> {
    const campaigns = await this.useCase.execute(query.limit, query.skip);

    return CampaignsResponse.create(campaigns);
  }
}
