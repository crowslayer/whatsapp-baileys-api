import { NextFunction, Request, Response } from 'express';

import { SendImageCommand } from '@application/messages/image/SendImageCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendImageController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, caption, fileName } = req.body;

      if (!req.file) {
        throw new NotFoundError('Image file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'IMAGE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, fileSize: req.file.size })
        .build();

      const command = new SendImageCommand(instanceId, to, req.file.buffer, caption, fileName);
      await this.commandBus.dispatch(command);

      ResponseHandler.success(
        res,
        { sent: true },
        'Image sent successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
