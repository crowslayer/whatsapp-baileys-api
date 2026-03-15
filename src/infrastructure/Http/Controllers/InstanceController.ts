import { NextFunction, Request, Response } from 'express';
import pino from 'pino';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { CreateInstanceCommand } from '@application/commands/CreateInstanceCommand';
import { CreateInstanceHandler } from '@application/handlers/CreateInstanceHandler';
import { GetInstanceHandler } from '@application/handlers/GetInstanceHandler';
import { ListInstancesHandler } from '@application/handlers/ListInstancesHandler';
import { GetInstanceQuery } from '@application/queries/GetInstanceQuery';
import { ListInstancesQuery } from '@application/queries/ListInstancesQuery';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class InstanceController {
  private _logger = pino();

  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, webhookUrl, usePairingCode, phoneNumber } = req.body;

      const audit = new AuditDataBuilder('CREATE', 'INSTANCE')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ name })
        .build();

      const handler = new CreateInstanceHandler(this.repository, this.connectionManager);
      const command = new CreateInstanceCommand(name, webhookUrl, usePairingCode, phoneNumber);
      const instance = await handler.execute(command);

      this._logger.info(`Instance created: ${instance.instanceId}`);

      return ResponseHandler.created(
        res,
        instance.toJSON(),
        'Instance created successfully',
        audit
      );
    } catch (error: any) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('READ', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const handler = new GetInstanceHandler(this.repository);
      const query = new GetInstanceQuery(instanceId);
      const instance = await handler.execute(query);

      return ResponseHandler.success(
        res,
        instance.toJSON(),
        'Instance retrieved successfully',
        200,
        audit
      );
    } catch (error: any) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const audit = new AuditDataBuilder('LIST', 'INSTANCE')
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      const handler = new ListInstancesHandler(this.repository);
      const query = new ListInstancesQuery();
      const instances = await handler.execute(query);

      const data = instances.map((i) => i.toJSON());

      return ResponseHandler.success(res, data, 'Instances retrieved successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('DELETE', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      await this.connectionManager.logoutInstance(instanceId);
      await this.repository.delete(instanceId);

      this._logger.info(`Instance deleted: ${instanceId}`);

      return ResponseHandler.success(res, null, 'Instance deleted successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async disconnect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const audit = new AuditDataBuilder('DISCONNECT', 'INSTANCE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .build();

      await this.connectionManager.disconnectInstance(instanceId);

      this._logger.info(`Instance disconnected: ${instanceId}`);

      return ResponseHandler.success(res, null, 'Instance disconnected successfully', 200, audit);
    } catch (error: any) {
      next(error);
    }
  }

  async getQR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;

      const instance = await this.repository.findById(instanceId);
      if (!instance) {
        throw new NotFoundError(instanceId);
      }

      if (!instance.qrCode) {
        throw new WhatsAppConnectionError('QR Code not available yet');
      }

      return ResponseHandler.success(
        res,
        { qrCode: instance.qrCode },
        'QR Code retrieved successfully'
      );
    } catch (error: any) {
      next(error);
    }
  }
}
