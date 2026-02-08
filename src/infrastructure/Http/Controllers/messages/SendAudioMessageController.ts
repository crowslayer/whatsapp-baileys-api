import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendAudioCommand } from '@application/commands/SendAudioCommand';
import { SendAudioHandler } from '@application/handlers/SendAudioHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

import { Controller } from '../Controller';

export class SendAudioMessageController implements Controller {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, ptt } = req.body;

      if (!req.file) {
        throw new NotFoundError('Audio file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'AUDIO')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, ptt: ptt === 'true', fileSize: req.file.size })
        .build();

      const handler = new SendAudioHandler(this.repository, this.connectionManager);
      const command = new SendAudioCommand(
        instanceId,
        to,
        req.file.buffer,
        ptt === 'true',
        req.file.mimetype
      );
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Audio sent successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
