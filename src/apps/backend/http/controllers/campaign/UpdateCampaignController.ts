import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { normalizeBulk } from '@shared/infrastructure/utils/normalizeBulk';

import { UpdateCampaignCommand } from '@modules/campaign/application/update/UpdateCampaignCommand';

type CampaignRequest = IHttpRequest & {
  params: { id: string };
  body: {
    campaign: {
      instanceId: string;
      name: string;
      description: string;
      message: string;
      numbers: string[];
    };
  };
};

export class UpdateCampaignController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: CampaignRequest): Promise<HttpResponse<unknown>> {
    const { campaign } = req.body;
    const { id } = req.params;

    const { valid, invalid } = normalizeBulk(campaign.numbers);
    const props = Object.assign(campaign, { numbers: valid, campaignId: id });
    const command = new UpdateCampaignCommand(props);

    await this.commandBus.dispatch<void>(command);

    const content = {
      campaign: {
        name: campaign.name,
        numbers: {
          valid: valid.length,
          invalid: invalid.length,
        },
      },
    };

    return ResponseBuilder.ok(content);
  }
}
