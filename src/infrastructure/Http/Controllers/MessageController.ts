import { NextFunction, Request, Response } from 'express';
import pino from 'pino';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendMessageCommand } from '@application/commands/SendMessageCommand';
import { SendMessageHandler } from '@application/handlers/SendMessageHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class MessageController {
  private logger = pino();

  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async send(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, message } = req.body;

      const audit = new AuditDataBuilder('SEND', 'MESSAGE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, messageLength: message.length })
        .build();

      const handler = new SendMessageHandler(this.repository, this.connectionManager);
      const command = new SendMessageCommand(instanceId, to, message);
      await handler.execute(command);

      this.logger.info(`Message sent from instance ${instanceId} to ${to}`);

      return ResponseHandler.success(res, { sent: true }, 'Message sent successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }
}
