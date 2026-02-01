import { CreateGroupCommand } from '@application/Commands/CreateGroupCommand';
import { CreateGroupHandler } from '@application/Handlers/CreateGroupHandler';
import { IWhatsAppInstanceRepository } from '@domain/Repositories/IWhatsAppInstanceRepository';
import { BaileysConnectionManager } from '@infrastructure/Baileys/BaileysConnectionManager';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import { Request, Response } from 'express';
import pino from 'pino';


export class GroupController {
    private logger = pino();
  
    constructor(
      private repository: IWhatsAppInstanceRepository,
      private connectionManager: BaileysConnectionManager
    ) {}
  
    async create(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId } = req.params;
        const { name, participants } = req.body;
  
        const audit = new AuditDataBuilder('CREATE', 'GROUP')
          .withResourceId(instanceId)
          .withRequest(req.ip, req.get('user-agent'))
          .withDetails({ groupName: name, participantsCount: participants.length })
          .build();
  
        const handler = new CreateGroupHandler(this.repository, this.connectionManager);
        const command = new CreateGroupCommand(instanceId, name, participants);
        const groupId = await handler.execute(command);
  
        this.logger.info(`Group created: ${groupId} on instance ${instanceId}`);
  
        return ResponseHandler.created(res, { groupId }, 'Group created successfully', audit);
      } catch (error: any) {
        this.logger.error('Error creating group:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async addParticipants(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId, groupId } = req.params;
        const { participants } = req.body;
  
        const audit = new AuditDataBuilder('ADD_PARTICIPANTS', 'GROUP')
          .withResourceId(groupId)
          .withRequest(req.ip, req.get('user-agent'))
          .withDetails({ instanceId, participantsCount: participants.length })
          .build();
  
        const adapter = this.connectionManager.getConnection(instanceId);
        if (!adapter) {
          return ResponseHandler.badRequest(res, 'Instance not connected');
        }
  
        await adapter.addParticipantsToGroup(groupId, participants);
  
        this.logger.info(`Participants added to group ${groupId}`);
  
        return ResponseHandler.success(res, { added: true }, 'Participants added successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error adding participants:', error);
        return this.handleError(error, res, req);
      }
    }
  
    async removeParticipants(req: Request, res: Response): Promise<Response> {
      try {
        const { instanceId, groupId } = req.params;
        const { participants } = req.body;
  
        const audit = new AuditDataBuilder('REMOVE_PARTICIPANTS', 'GROUP')
          .withResourceId(groupId)
          .withRequest(req.ip, req.get('user-agent'))
          .withDetails({ instanceId, participantsCount: participants.length })
          .build();
  
        const adapter = this.connectionManager.getConnection(instanceId);
        if (!adapter) {
          return ResponseHandler.badRequest(res, 'Instance not connected');
        }
  
        await adapter.removeParticipantsFromGroup(groupId, participants);
  
        this.logger.info(`Participants removed from group ${groupId}`);
  
        return ResponseHandler.success(res, { removed: true }, 'Participants removed successfully', 200, audit);
      } catch (error: any) {
        this.logger.error('Error removing participants:', error);
        return this.handleError(error, res, req);
      }
    }
  
    private handleError(error: any, res: Response, req: Request): Response {
      const audit = new AuditDataBuilder('ERROR', 'GROUP')
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ error: error.message })
        .build();
  
      if (error.name === 'ValidationError') {
        return ResponseHandler.badRequest(res, error.message, error.fields, audit);
      }
      if (error.name === 'NotFoundError') {
        return ResponseHandler.notFound(res, error.message, audit);
      }
      return ResponseHandler.internalError(res, error.message, undefined, audit);
    }
  }