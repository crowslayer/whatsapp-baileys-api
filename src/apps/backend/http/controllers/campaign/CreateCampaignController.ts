import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { normalizeBulk } from '@shared/infrastructure/utils/normalizeBulk';

import { CreateCampaignCommand } from '@modules/campaign/application/create/CreateCampaignCommand';

type CampaignRequest = IHttpRequest & {
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

export class CreateCampaignController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: CampaignRequest): Promise<HttpResponse<unknown>> {
    const { instanceId, name, description, message, numbers } = req.body.campaign;

    const { valid, invalid } = normalizeBulk(numbers);

    const command = new CreateCampaignCommand({
      instanceId,
      name,
      description,
      message,
      numbers: valid,
    });

    await this.commandBus.dispatch<void>(command);

    const content = {
      campaign: {
        name,
        numbers: {
          valid: valid.length,
          invalid: invalid.length,
        },
      },
    };

    return ResponseBuilder.created(content);
  }
}
