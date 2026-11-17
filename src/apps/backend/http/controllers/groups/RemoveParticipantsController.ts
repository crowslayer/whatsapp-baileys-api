import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { ValidationError } from '@shared/domain/error/ValidationError';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { RemoveParticipantsGroupCommand } from '@modules/groups/application/participants/remove/RemoveParticipantsGroupCommand';

interface IRemoveParticipantsRequst extends IHttpRequest {
  params: { instanceId: string; groupId: string };
  body: {
    group: {
      participants: string[];
    };
  };
}

export class RemoveParticipantsController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: IRemoveParticipantsRequst): Promise<HttpResponse<unknown>> {
    const { instanceId, groupId } = req.params;
    const { participants } = req.body.group;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      throw new ValidationError([
        { field: 'participants', message: 'Participants must be a non-empty array' },
      ]);
    }

    const command = new RemoveParticipantsGroupCommand(instanceId, groupId, participants);

    await this.commandBus.dispatch(command);

    return ResponseBuilder.ok({ removed: true });
  }
}
