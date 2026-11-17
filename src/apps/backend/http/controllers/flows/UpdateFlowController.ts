import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { UpdateFlowCommand } from '@modules/flows/application/update/UpdateFlowCommand';

interface IUpdateFlowRequest extends IHttpRequest {
  params: { flowId: string };
  body: {
    flow: {
      instanceId: string;
      name: string;
    };
  };
}

export class UpdateFlowController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: IUpdateFlowRequest): Promise<HttpResponse<unknown>> {
    const { flowId } = req.params;
    const { instanceId, name } = req.body.flow;

    const cmd = new UpdateFlowCommand(flowId, instanceId, name);

    await this.commandBus.dispatch(cmd);

    const content = {
      flow: {
        flowId,
        instanceId,
        name,
      },
    };

    return ResponseBuilder.ok(content);
  }
}
