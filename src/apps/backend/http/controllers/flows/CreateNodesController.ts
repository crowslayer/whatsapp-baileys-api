import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { CreateNodesCommand } from '@modules/flows/application/nodes/create/CreateNodesCommand';
import { Nodes, Trigger } from '@modules/flows/domain/FlowTypes';

interface INodeRequest extends IHttpRequest {
  body: {
    nodes: { flowId: string; nodes: Nodes; start: string; triggers: Trigger[] };
  };
}

export class CreateNodesController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: INodeRequest): Promise<HttpResponse<unknown>> {
    const { flowId, nodes, start, triggers = [] } = req.body.nodes;

    const cmd = new CreateNodesCommand(flowId, nodes, start, triggers);

    await this.commandBus.dispatch(cmd);

    const content = {
      flowId,
      start,
    };

    return ResponseBuilder.created(content);
  }
}
