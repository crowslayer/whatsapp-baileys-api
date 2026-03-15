import { NextFunction, Request, Response } from 'express';

import { SendContactCommand } from '@application/messages/contact/SendContactCommand';

import { StatusCode } from '@infrastructure/http/StatusCode';

import { ICommandBus } from '@shared/domain/commands/CommandBus';
import { AuditDataBuilder } from '@shared/infrastructure/AuditData';
import { NotFoundError } from '@shared/infrastructure/errors/NotFoundError';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';

export class SendContactController {
  constructor(private readonly commandBus: ICommandBus) {}

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

      const command = new SendContactCommand(instanceId, to, validContacts);
      await this.commandBus.dispatch(command);

      ResponseHandler.success(
        res,
        { sent: true },
        'Contact(s) sent successfully',
        StatusCode.SuccessOK,
        audit
      );
    } catch (error) {
      next(error);
    }
  }
}
