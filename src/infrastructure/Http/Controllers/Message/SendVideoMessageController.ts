import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { SendVideoCommand } from "@application/Commands/SendVideoCommand";
import { SendVideoHandler } from "@application/Handlers/SendVideoHandler";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { NotFoundError } from "@shared/infrastructure/Error/NotFoundError";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class SendVideoMessageController implements Controller {

    constructor(
        private readonly repository: IWhatsAppInstanceRepository,
        private readonly connectionManager: BaileysConnectionManager
    ) { }


    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { instanceId } = req.params;
            const { to, caption, gifPlayback, fileName } = req.body;

            if (!req.file) {
                throw new NotFoundError('Video file is required')
            }

            const audit = new AuditDataBuilder('SEND', 'VIDEO')
                .withResourceId(instanceId)
                .withRequest(req.ip, req.get('user-agent'))
                .withDetails({ to, gifPlayback: gifPlayback === 'true', fileSize: req.file.size })
                .build();

            const handler = new SendVideoHandler(this.repository, this.connectionManager);
            const command = new SendVideoCommand(
                instanceId,
                to,
                req.file.buffer,
                caption,
                gifPlayback === 'true',
                fileName
            );
            await handler.execute(command);

            ResponseHandler.success(res, { sent: true }, 'Video sent successfully', 200, audit);

        } catch (error) {
            next(error);
        }
    }
}