import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { SendReactionCommand } from "@application/Commands/SendReactionCommand";
import { SendReactionHandler } from "@application/Handlers/SendReactionHandler";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class SendReactionMessageController implements Controller {

    constructor(
        private readonly repository: IWhatsAppInstanceRepository,
        private readonly connectionManager: BaileysConnectionManager
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { instanceId } = req.params;
            const { messageId, emoji, chatId } = req.body;

            const audit = new AuditDataBuilder('SEND', 'REACTION')
                .withResourceId(instanceId)
                .withRequest(req.ip, req.get('user-agent'))
                .withDetails({ messageId, emoji, chatId })
                .build();

            const handler = new SendReactionHandler(this.repository, this.connectionManager);
            const command = new SendReactionCommand(instanceId, messageId, emoji, chatId);
            await handler.execute(command);

            ResponseHandler.success(res, { sent: true }, 'Reaction sent successfully', 200, audit);

        } catch (error) {
            next(error);
        }
    }

}