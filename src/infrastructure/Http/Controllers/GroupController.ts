import { NextFunction, Request, Response } from 'express';
import pino from 'pino';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { CreateGroupCommand } from '@application/commands/CreateGroupCommand';
import { CreateGroupHandler } from '@application/handlers/CreateGroupHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { WhatsAppConnectionError } from '@shared/infrastructure/Error/WhatsAppConnectionError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class GroupController {
  private logger = pino();

  constructor(
    private repository: IWhatsAppInstanceRepository,
    private connectionManager: BaileysConnectionManager
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  async addParticipants(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      return ResponseHandler.success(
        res,
        { added: true },
        'Participants added successfully',
        200,
        audit
      );
    } catch (error: any) {
      next(error);
    }
  }

  async removeParticipants(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      return ResponseHandler.success(
        res,
        { removed: true },
        'Participants removed successfully',
        200,
        audit
      );
    } catch (error: any) {
      next(error);
    }
  }
}
