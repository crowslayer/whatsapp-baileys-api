import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { CreateInstanceCommand } from '@application/commands/CreateInstanceCommand';
import { CreateInstanceHandler } from '@application/handlers/CreateInstanceHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

import { Controller } from '../Controller';

export class InstanceCreateController implements Controller {
  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, webhookUrl, usePairingCode, phoneNumber } = req.body;

      const audit = new AuditDataBuilder('CREATE', 'INSTANCE')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ name })
        .build();

      const handler = new CreateInstanceHandler(this.repository, this.connectionManager);
      const command = new CreateInstanceCommand(name, webhookUrl, usePairingCode, phoneNumber);
      const instance = await handler.execute(command);

      ResponseHandler.created(res, instance.toJSON(), 'Instance created successfully', audit);
    } catch (error: any) {
      next(error);
    }
  }
}
