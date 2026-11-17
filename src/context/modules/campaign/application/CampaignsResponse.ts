import { IResponse } from '@shared/domain/Response';

import { CampaignReadModel } from '@modules/campaign/domain/ICampaignReadRepository';

export class CampaignsResponse implements IResponse {
  private constructor(readonly content: CampaignReadModel[]) {}

  static create(campaigns: CampaignReadModel[]): CampaignsResponse {
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      return new CampaignsResponse(campaigns);
    }
    return CampaignsResponse.none();
  }

  static none(): CampaignsResponse {
    return new CampaignsResponse([]);
  }
}
