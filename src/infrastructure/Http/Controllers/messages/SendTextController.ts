import { NextFunction, Request, Response } from 'express';

import { SendMessageCommand } from '@application/messages/text/SendMessageCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendTextController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, message } = req.body;

      const audit = new AuditDataBuilder('SEND', 'MESSAGE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, messageLength: message.length })
        .build();

      const command = new SendMessageCommand(instanceId, to, message);
      await this.commandBus.dispatch(command);

      ResponseHandler.success(
        res,
        { sent: true },
        'Message sent successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
