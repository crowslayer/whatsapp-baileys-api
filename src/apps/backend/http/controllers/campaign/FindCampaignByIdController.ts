import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { CampaignByIdQuery } from '@modules/campaign/application/find/by-id/CampaignByIdQuery';

type CampaignRequest = IHttpRequest & {
  params: { campaignId: string };
};

export class FindCampaignByIdController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: CampaignRequest): Promise<HttpResponse<unknown>> {
    const { campaignId } = req.params;

    const query = new CampaignByIdQuery(campaignId);

    const result = await this.queryBus.ask(query);

    const content = {
      campaign: result.content ?? {},
    };

    return ResponseBuilder.ok(content);
  }
}
