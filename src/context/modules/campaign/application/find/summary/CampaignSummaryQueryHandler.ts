import { DomainError } from '@shared/domain/error/DomainError';
import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';
import { CampaignSummaryQuery } from '@modules/campaign/application/find/summary/CampaignSummaryQuery';
import { SummaryFinder } from '@modules/campaign/application/find/summary/SummaryFinder';
import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';
import { CampaignReadModel } from '@modules/campaign/domain/ICampaignReadRepository';

export class CampaignSummaryQueryHandler implements IQueryHandler<
  CampaignSummaryQuery,
  CampaignResponse<CampaignReadModel | null>
> {
  constructor(private readonly useCase: SummaryFinder) {}

  subscribedTo(): typeof CampaignSummaryQuery {
    return CampaignSummaryQuery;
  }

  async handle(query: CampaignSummaryQuery): Promise<CampaignResponse<CampaignReadModel>> {
    try {
      const item = await this.useCase.execute(query.campaignId);

      if (!item) {
        throw new CampaignNotFoundError('Campaign Summary not found');
      }

      return CampaignResponse.create<CampaignReadModel>(item);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw error;
    }
  }
}
