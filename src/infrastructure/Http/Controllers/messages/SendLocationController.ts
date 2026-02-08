import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendLocationCommand } from '@application/commands/SendLocationCommand';
import { SendLocationHandler } from '@application/handlers/SendLocationHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendLocationController {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, latitude, longitude, name, address } = req.body;

      const audit = new AuditDataBuilder('SEND', 'LOCATION')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, latitude, longitude })
        .build();

      const handler = new SendLocationHandler(this.repository, this.connectionManager);
      const command = new SendLocationCommand(
        instanceId,
        to,
        parseFloat(latitude),
        parseFloat(longitude),
        name,
        address
      );
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Location sent successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
