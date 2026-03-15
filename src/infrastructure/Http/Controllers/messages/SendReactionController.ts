import { NextFunction, Request, Response } from 'express';

import { SendReactionCommand } from '@application/messages/reaction/SendReactionCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendReactionController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { messageId, emoji, chatId } = req.body;

      const audit = new AuditDataBuilder('SEND', 'REACTION')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ messageId, emoji, chatId })
        .build();

      const command = new SendReactionCommand(instanceId, messageId, emoji, chatId);
      await this.commandBus.dispatch(command);

      ResponseHandler.success(
        res,
        { sent: true },
        'Reaction sent successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
