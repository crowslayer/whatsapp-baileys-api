import { NextFunction, Request, Response } from 'express';

import { SendDocumentCommand } from '@application/messages/document/SendDocumentCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendDocumentController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, caption } = req.body;

      if (!req.file) {
        throw new NotFoundError('Document file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'DOCUMENT')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, fileName: req.file.originalname, fileSize: req.file.size })
        .build();

      const command = new SendDocumentCommand(
        instanceId,
        to,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        caption
      );
      await this.commandBus.dispatch(command);

      ResponseHandler.success(
        res,
        { sent: true },
        'Document sent successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
