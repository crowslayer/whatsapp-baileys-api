import { Query } from '@shared/domain/query/Query';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';
import { CampaignStats } from '@modules/campaign/domain/ICampaignReadRepository';

export class CampaignStatsQuery extends Query<CampaignResponse<CampaignStats>> {}
