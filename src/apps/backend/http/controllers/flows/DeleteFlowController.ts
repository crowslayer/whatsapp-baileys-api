import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { DeleteFlowCommand } from '@modules/flows/application/delete/DeleteFlowCommand';

type DeleteRequest = IHttpRequest & {
  params: { flowId: string };
};

export class DeleteFlowController implements IController {
  constructor(private readonly commandbus: ICommandBus) {}

  async handle(req: DeleteRequest): Promise<HttpResponse<unknown>> {
    const { flowId } = req.params;

    const cmd = new DeleteFlowCommand(flowId);

    await this.commandbus.dispatch(cmd);

    return ResponseBuilder.noContent();
  }
}
