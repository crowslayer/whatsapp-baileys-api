import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { CreateGroupCommand } from '@modules/groups/application/create/CreateGroupCommand';

interface ICreateGroupRequest extends IHttpRequest {
  params: { instanceId: string };
  body: {
    group: {
      name: string;
      participants: string[];
    };
  };
}

export class CreateGroupController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: ICreateGroupRequest): Promise<HttpResponse<unknown>> {
    const { instanceId } = req.params;
    const { name, participants } = req.body.group;

    const command = new CreateGroupCommand(instanceId, name, participants);
    const groupId = await this.commandBus.dispatch(command);

    return ResponseBuilder.created(groupId);
  }
}
