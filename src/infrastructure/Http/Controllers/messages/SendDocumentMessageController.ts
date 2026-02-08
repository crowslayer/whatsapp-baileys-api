import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendDocumentCommand } from '@application/commands/SendDocumentCommand';
import { SendDocumentHandler } from '@application/handlers/SendDocumentHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

import { Controller } from '../Controller';

export class SendDocumentMessageController implements Controller {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) {}

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

      const handler = new SendDocumentHandler(this.repository, this.connectionManager);
      const command = new SendDocumentCommand(
        instanceId,
        to,
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        caption
      );
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Document sent successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
