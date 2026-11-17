import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { IQueryBus } from '@shared/domain/query/QueryBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { CampaignsResponse } from '@modules/campaign/application/CampaignsResponse';
import { ListCampaignQuery } from '@modules/campaign/application/find/list/ListCampaignQuery';

type CampaignRequest = IHttpRequest & {
  params: {
    limit?: number;
    skip?: number;
  };
};

export class ListCampaignsController implements IController {
  constructor(private readonly queryBus: IQueryBus) {}

  async handle(req: CampaignRequest): Promise<HttpResponse<unknown>> {
    const { limit, skip } = req.params;

    const limitQuery = limit;
    const skipQuery = skip;

    const query = new ListCampaignQuery(limitQuery, skipQuery);

    const result = await this.queryBus.ask<CampaignsResponse>(query);

    const content = {
      campaigns: result.content,
    };

    return ResponseBuilder.ok(content);
  }
}
