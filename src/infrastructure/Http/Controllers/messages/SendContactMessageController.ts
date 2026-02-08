import { NextFunction, Request, Response } from 'express';

import { IWhatsAppInstanceRepository } from '@domain/repositories/IWhatsAppInstanceRepository';

import { SendContactCommand } from '@application/commands/SendContactCommand';
import { SendContactHandler } from '@application/handlers/SendContactHandler';

import { BaileysConnectionManager } from '@infrastructure/baileys/BaileysConnectionManager';

import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

import { Controller } from '../Controller';

export class SendContactMessageController implements Controller {
  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, contacts } = req.body;

      if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        throw new NotFoundError('At least one contact with displayName and vcard is required');
      }

      const validContacts = contacts.map((c: { displayName?: string; vcard?: string }) => ({
        displayName: c.displayName || 'Contact',
        vcard: c.vcard || '',
      }));

      const audit = new AuditDataBuilder('SEND', 'CONTACT')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, contactCount: validContacts.length })
        .build();

      const handler = new SendContactHandler(this.repository, this.connectionManager);
      const command = new SendContactCommand(instanceId, to, validContacts);
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Contact(s) sent successfully', 200, audit);
    } catch (error) {
      next(error);
    }
  }
}
