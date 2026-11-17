import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { CreateFlowCommand } from '@modules/flows/application/create/CreateFlowCommand';

interface IFlowRequest extends IHttpRequest {
  body: {
    flow: {
      instanceId: string;
      name: string;
    };
  };
}

export class CreateFlowController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: IFlowRequest): Promise<HttpResponse<unknown>> {
    const { flow } = req.body;

    const cmd = new CreateFlowCommand(flow.instanceId, flow.name);

    await this.commandBus.dispatch(cmd);

    const content = {
      instanceId: flow.instanceId,
      name: flow.name,
    };

    return ResponseBuilder.created(content);
  }
}
