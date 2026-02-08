import { NextFunction, Request, Response } from 'express';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { WhatsAppConnectionError } from '@shared/infrastructure/errors/WhatsAppConnectionError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class RemoveParticipantsController {
  constructor(private readonly connectionManager: BaileysConnectionManager) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      return ResponseHandler.success(
        res,
        { removed: true },
        'Participants removed successfully',
        200,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
