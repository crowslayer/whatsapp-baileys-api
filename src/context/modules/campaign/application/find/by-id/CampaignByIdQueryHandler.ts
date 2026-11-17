import { DomainError } from '@shared/domain/error/DomainError';
import { IQueryHandler } from '@shared/domain/query/QueryHandler';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';
import { CampaignByIdQuery } from '@modules/campaign/application/find/by-id/CampaignByIdQuery';
import { CampaignFinderById } from '@modules/campaign/application/find/by-id/CampaignFinderById';
import { CampaignNotFoundError } from '@modules/campaign/domain/CampaignNotFoundError';
import { CampaignReadModel } from '@modules/campaign/domain/ICampaignReadRepository';

export class CampaignByIdQueryHandler implements IQueryHandler<
  CampaignByIdQuery,
  CampaignResponse<CampaignReadModel | null>
> {
  constructor(private readonly useCase: CampaignFinderById) {}

  subscribedTo(): typeof CampaignByIdQuery {
    return CampaignByIdQuery;
  }

  async handle(query: CampaignByIdQuery): Promise<CampaignResponse<CampaignReadModel>> {
    try {
      const document = await this.useCase.execute(query.campaignId);
      if (!document) {
        throw new CampaignNotFoundError('Campaign not found');
      }
      return CampaignResponse.create(document);
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }
      throw error;
    }
  }
}
