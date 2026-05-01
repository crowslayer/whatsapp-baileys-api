import { ICampaignListItem } from '@domain/campaign/ICampaignReadRepository';

import { IResponse } from '@shared/domain/Response';

export class CampaignsResponse implements IResponse {
  private constructor(readonly content: ICampaignListItem[]) {}

  static create(campaigns: ICampaignListItem[]): CampaignsResponse {
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      return new CampaignsResponse(campaigns);
    }
    return CampaignsResponse.none();
  }

  static none(): CampaignsResponse {
    return new CampaignsResponse([]);
  }
}
