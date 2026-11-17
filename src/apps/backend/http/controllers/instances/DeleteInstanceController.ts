import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { DeleteInstanceCommand } from '@modules/instances/application/delete/DeleteInstanceCommand';

type DeleteInstanceRequest = IHttpRequest & {
  params: { instanceId: string };
};

export class DeleteInstanceController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: DeleteInstanceRequest): Promise<HttpResponse<null>> {
    const { instanceId } = req.params;

    const command = new DeleteInstanceCommand(instanceId);
    await this.commandBus.dispatch(command);

    return ResponseBuilder.noContent();
  }
}
