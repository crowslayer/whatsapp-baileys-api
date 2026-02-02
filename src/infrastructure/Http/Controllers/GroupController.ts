import { NextFunction, Request, Response } from 'express';
import { CreateGroupCommand } from '@application/Commands/CreateGroupCommand';
import { CreateGroupHandler } from '@application/Handlers/CreateGroupHandler';
import { IWhatsAppInstanceRepository } from '@domain/Repositories/IWhatsAppInstanceRepository';
import { BaileysConnectionManager } from '@infrastructure/Baileys/BaileysConnectionManager';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
import pino from 'pino';
import { WhatsAppConnectionError } from '@shared/infrastructure/Error/WhatsAppConnectionError';


export class GroupController {
    private logger = pino();
  
    constructor(
      private repository: IWhatsAppInstanceRepository,
      private connectionManager: BaileysConnectionManager
    ) {}
  
    async create(req: Request, res: Response, next:NextFunction): Promise<void> {
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
        next(error)
      }
    }
  
    async addParticipants(req: Request, res: Response, next:NextFunction): Promise<void> {
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
          ResponseHandler.badRequest(res, 'Instance not connected');
          return;
        }
  
        await adapter.addParticipantsToGroup(groupId, participants);
  
        this.logger.info(`Participants added to group ${groupId}`);
  
        return ResponseHandler.success(res, { added: true }, 'Participants added successfully', 200, audit);
        
      } catch (error: any) {
        next(error);
      }
    }
  
    async removeParticipants(req: Request, res: Response, next:NextFunction): Promise<void> {
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
          throw new WhatsAppConnectionError('Instance not connected');
        }
  
        await adapter.removeParticipantsFromGroup(groupId, participants);
  
        this.logger.info(`Participants removed from group ${groupId}`);
  
        return ResponseHandler.success(res, { removed: true }, 'Participants removed successfully', 200, audit);
        
      } catch (error: any) {
        next(error);
      }
    }
  
  }