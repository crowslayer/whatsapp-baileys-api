import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { DeleteCampaignCommand } from '@modules/campaign/application/delete/DeleteCampaignCommand';

type DeleteCampaign = IHttpRequest & {
  params: { id: string };
};

export class DeleteCampaignController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: DeleteCampaign): Promise<HttpResponse<null>> {
    const { id } = req.params;

    const command = new DeleteCampaignCommand(id);

    await this.commandBus.dispatch<void>(command);

    return ResponseBuilder.noContent();
  }
}
