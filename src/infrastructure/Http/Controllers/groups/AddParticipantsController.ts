import { NextFunction, Request, Response } from 'express';

import { AddParticipantGroupCommand } from '@application/groups/participants/add/AddParticipantGroupCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class AddParticipantsController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId, groupId } = req.params;
      const { participants } = req.body;

      const audit = new AuditDataBuilder('ADD_PARTICIPANTS', 'GROUP')
        .withResourceId(groupId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ instanceId, participantsCount: participants.length })
        .build();

      const command = new AddParticipantGroupCommand(instanceId, groupId, participants);
      await this.commandBus.dispatch(command);

      return ResponseHandler.success(
        res,
        { added: true },
        'Participants added successfully',
        200,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
