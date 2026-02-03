import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { SendStickerCommand } from "@application/Commands/SendStickerCommand";
import { SendStickerHandler } from "@application/Handlers/SendStickerHandler";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { NotFoundError } from "@shared/infrastructure/Error/NotFoundError";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class SendStickerMessageController implements Controller{

    constructor(
        private readonly repository: IWhatsAppInstanceRepository,
        private readonly connectionManager: BaileysConnectionManager
    ){}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { instanceId } = req.params;
            const { to } = req.body;
    
            if (!req.file) {
              throw new NotFoundError('Sticker file is required')
            }
    
            const audit = new AuditDataBuilder('SEND', 'STICKER')
              .withResourceId(instanceId)
              .withRequest(req.ip, req.get('user-agent'))
              .withDetails({ to, fileSize: req.file.size })
              .build();
    
            const handler = new SendStickerHandler(this.repository, this.connectionManager);
            const command = new SendStickerCommand(instanceId, to, req.file.buffer);
            await handler.execute(command);
    
            ResponseHandler.success(res, { sent: true }, 'Sticker sent successfully', 200, audit);
            
          } catch (error) {
            next(error);
          }   
    }
}