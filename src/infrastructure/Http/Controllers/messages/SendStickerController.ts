import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendStickerCommand } from '@application/commands/SendStickerCommand';
import { SendStickerHandler } from '@application/handlers/SendStickerHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendStickerController {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to } = req.body;

      if (!req.file) {
        throw new NotFoundError('Sticker file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'STICKER')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, fileSize: req.file.size })
        .build();

      const handler = new SendStickerHandler(this.repository, this.connectionManager);
      const command = new SendStickerCommand(instanceId, to, req.file.buffer);
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Sticker sent successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
