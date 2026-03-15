import { NextFunction, Request, Response } from 'express';

import { CreateGroupCommand } from '@application/groups/create/CreateGroupCommand';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class CreateGroupController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { name, participants } = req.body;

      const audit = new AuditDataBuilder('CREATE', 'GROUP')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ groupName: name, participantsCount: participants.length })
        .build();

      const command = new CreateGroupCommand(instanceId, name, participants);
      const groupId = await this.commandBus.dispatch(command);

      return ResponseHandler.created(res, { groupId }, 'Group created successfully', audit);
    } catch (error) {
      next(error);
    }
  }
}
