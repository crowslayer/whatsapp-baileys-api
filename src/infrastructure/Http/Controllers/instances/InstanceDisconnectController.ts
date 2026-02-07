import { NextFunction, Request, Response } from 'express';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

import { Controller } from '../Controller';

export class InstanceDisconnectController implements Controller {
  constructor(private readonly connectionManager: BaileysConnectionManager) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('DISCONNECT', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      await this.connectionManager.disconnectInstance(instanceId);

      ResponseHandler.success(res, null, 'Instance disconnected successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }
}
