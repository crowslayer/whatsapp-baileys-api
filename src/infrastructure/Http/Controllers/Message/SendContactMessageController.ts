import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { SendContactCommand } from "@application/Commands/SendContactCommand";
import { SendContactHandler } from "@application/Handlers/SendContactHandler";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { NotFoundError } from "@shared/infrastructure/Error/NotFoundError";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class SendContactMessageController implements Controller {

    constructor(
        private readonly repository: IWhatsAppInstanceRepository,
        private readonly connectionManager: BaileysConnectionManager
    ) { }

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