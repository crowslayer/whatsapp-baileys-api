import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { DeleteNodesCommand } from '@modules/flows/application/nodes/delete/DeleteNodesCommand';

type DeleteNodeRequest = IHttpRequest & {
  params: { flowId: string };
};

export class DeleteNodesController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: DeleteNodeRequest): Promise<HttpResponse<unknown>> {
    const { flowId } = req.params;

    const cmd = new DeleteNodesCommand(flowId);

    await this.commandBus.dispatch(cmd);

    return ResponseBuilder.noContent();
  }
}
