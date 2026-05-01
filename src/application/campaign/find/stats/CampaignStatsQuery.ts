import { ICampaignStats } from '@domain/campaign/ICampaignReadRepository';

import { CampaignResponse } from '@application/campaign/CampaignResponse';

import { Query } from '@shared/domain/query/Query';

export class CampaignStatsQuery extends Query<CampaignResponse<ICampaignStats>> {}
