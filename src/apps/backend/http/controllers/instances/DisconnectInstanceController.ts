import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { DisconnectInstanceCommand } from '@modules/instances/application/disconnect/DisconnectInstanceCommand';

type DisconnectRequest = IHttpRequest & {
  params: { instanceId: string };
};

export class DisconnectInstanceController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: DisconnectRequest): Promise<HttpResponse<null>> {
    const { instanceId } = req.params;

    const command = new DisconnectInstanceCommand(instanceId);
    await this.commandBus.dispatch(command);

    return ResponseBuilder.noContent();
  }
}
