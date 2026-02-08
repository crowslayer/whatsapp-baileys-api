import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendImageCommand } from '@application/commands/SendImageCommand';
import { SendImageHandler } from '@application/handlers/SendImageHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendImageController {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) {}

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

      const handler = new SendImageHandler(this.repository, this.connectionManager);
      const command = new SendImageCommand(instanceId, to, req.file.buffer, caption, fileName);
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Image sent successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
