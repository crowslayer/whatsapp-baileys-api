import { Request, Response } from 'express';
import { CreateInstanceCommand } from "@application/Commands/CreateInstanceCommand";
import { CreateInstanceHandler } from "@application/Handlers/CreateInstanceHandler";
import { GetInstanceHandler } from "@application/Handlers/GetInstanceHandler";
import { ListInstancesHandler } from "@application/Handlers/ListInstancesHandler";
import { GetInstanceQuery } from "@application/Queries/GetInstanceQuery";
import { ListInstancesQuery } from "@application/Queries/ListInstancesQuery";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";
import pino from "pino";

export class InstanceController {
    private logger = pino();
  
    constructor(
      private repository: IWhatsAppInstanceRepository,
      private connectionManager: BaileysConnectionManager
    ) {}
  
    async create(req: Request, res: Response): Promise<Response> {
      try {
        const { name, webhookUrl, usePairingCode, phoneNumber } = req.body;
  
        const audit = new AuditDataBuilder('CREATE', 'INSTANCE')
          .withRequest(req.ip, req.get('user-agent'))
          .withDetails({ name })
          .build();
  
        const handler = new CreateInstanceHandler(this.repository, this.connectionManager);
        const command = new CreateInstanceCommand(name, webhookUrl, usePairingCode, phoneNumber);
        const instance = await handler.execute(command);
  
        this.logger.info(`Instance created: ${instance.instanceId}`);
  
        return ResponseHandler.created(res, instance.toJSON(), 'Instance created successfully', audit);
      } catch (error: any) {
        this.logger.error('Error creating instance:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async getById(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
  
        const audit = new AuditDataBuilder('READ', 'INSTANCE')
          .withResourceId(instanceId)
          .withRequest(req.ip, req.get('user-agent'))
          .build();
  
        const handler = new GetInstanceHandler(this.repository);
        const query = new GetInstanceQuery(instanceId);
        const instance = await handler.execute(query);
  
        return ResponseHandler.success(res, instance.toJSON(), 'Instance retrieved successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error getting instance:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async list(req: Request, res: Response): Promise<Response> {
      try {
        const audit = new AuditDataBuilder('LIST', 'INSTANCE')
          .withRequest(req.ip, req.get('user-agent'))
          .build();
  
        const handler = new ListInstancesHandler(this.repository);
        const query = new ListInstancesQuery();
        const instances = await handler.execute(query);
  
        const data = instances.map(i => i.toJSON());
  
        return ResponseHandler.success(res, data, 'Instances retrieved successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error listing instances:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async delete(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
  
        const audit = new AuditDataBuilder('DELETE', 'INSTANCE')
          .withResourceId(instanceId)
          .withRequest(req.ip, req.get('user-agent'))
          .build();
  
        await this.connectionManager.logoutInstance(instanceId);
        await this.repository.delete(instanceId);
  
        this.logger.info(`Instance deleted: ${instanceId}`);
  
        return ResponseHandler.success(res, null, 'Instance deleted successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error deleting instance:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async disconnect(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
  
        const audit = new AuditDataBuilder('DISCONNECT', 'INSTANCE')
          .withResourceId(instanceId)
          .withRequest(req.ip, req.get('user-agent'))
          .build();
  
        await this.connectionManager.disconnectInstance(instanceId);
  
        this.logger.info(`Instance disconnected: ${instanceId}`);
  
        return ResponseHandler.success(res, null, 'Instance disconnected successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error disconnecting instance:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async getQR(req: Request, res: Response): Promise<Response | void> {
      try {
        const { instanceId } = req.params;
  
        const instance = await this.repository.findById(instanceId);
        if (!instance) {
          return ResponseHandler.notFound(res, `Instance ${instanceId} not found`);
        }
  
        if (!instance.qrCode) {
          return ResponseHandler.badRequest(res, 'QR Code not available yet');
        }
      
        return ResponseHandler.success(res, { qrCode: instance.qrCode }, 'QR Code retrieved successfully');
      } catch (error: any) {
        this.logger.error('Error getting QR code:', error);
        return this.handleError(error, res, req);
      }
    }
  
    private handleError(error: any, res: Response, req: Request): Response {
      const audit = new AuditDataBuilder('ERROR', 'INSTANCE')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ error: error.message })
        .build();
  
      if (error.name === 'ValidationError') {
        return ResponseHandler.badRequest(res, error.message, error.fields, audit);
      }
      if (error.name === 'NotFoundError') {
        return ResponseHandler.notFound(res, error.message, audit);
      }
      if (error.name === 'ConflictError') {
        return ResponseHandler.conflict(res, error.message, undefined, audit);
      }
      return ResponseHandler.internalError(res, error.message, undefined, audit);
    }
  }