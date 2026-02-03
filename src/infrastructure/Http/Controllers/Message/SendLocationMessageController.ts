import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { SendLocationCommand } from "@application/Commands/SendLocationCommand";
import { SendLocationHandler } from "@application/Handlers/SendLocationHandler";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class SendLocationMessageController implements Controller{

    constructor(
        private readonly repository: IWhatsAppInstanceRepository,
        private readonly connectionManager: BaileysConnectionManager
    ){}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
        const { instanceId } = req.params;
        const { to, latitude, longitude, name, address } = req.body;
  
        const audit = new AuditDataBuilder('SEND', 'LOCATION')
          .withResourceId(instanceId)
          .withRequest(req.ip, req.get('user-agent'))
          .withDetails({ to, latitude, longitude })
          .build();
  
        const handler = new SendLocationHandler(this.repository, this.connectionManager);
        const command = new SendLocationCommand(
          instanceId,
          to,
          parseFloat(latitude),
          parseFloat(longitude),
          name,
          address
        );
        await handler.execute(command);
  
        ResponseHandler.success(res, { sent: true }, 'Location sent successfully', 200, audit);
        
      } catch (error) {
        next(error);
      }
    }
}