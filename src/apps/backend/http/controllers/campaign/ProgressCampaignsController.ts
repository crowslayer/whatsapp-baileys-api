import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { CampaignResponse } from '@modules/campaign/application/CampaignResponse';
import { CampaignProgressQuery } from '@modules/campaign/application/find/progress/CampaignProgressQuery';
import { CampaignStats } from '@modules/campaign/domain/ICampaignReadRepository';

type CampaignRequest = IHttpRequest & {
  params: { id: string };
};

export class ProgressCampaignsController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: CampaignRequest): Promise<HttpResponse<unknown>> {
    const { id } = req.params;

    const query = new CampaignProgressQuery(id);

    const result = await this.queryBus.ask<CampaignResponse<CampaignStats>>(query);

    const content = {
      campaigns: result.content,
    };

    return ResponseBuilder.ok(content);
  }
}
