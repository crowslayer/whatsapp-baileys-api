import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { CreateInstanceCommand } from "@application/Commands/CreateInstanceCommand";
import { CreateInstanceHandler } from "@application/Handlers/CreateInstanceHandler";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class InstanceCreateController implements Controller{

    constructor(
        private repository: IWhatsAppInstanceRepository,
        private connectionManager: BaileysConnectionManager
    ){}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, webhookUrl, usePairingCode, phoneNumber } = req.body;
      
            const audit = new AuditDataBuilder('CREATE', 'INSTANCE')
              .withRequest(req.ip, req.get('user-agent'))
              .withDetails({ name })
              .build();
      
            const handler = new CreateInstanceHandler(this.repository, this.connectionManager);
            const command = new CreateInstanceCommand(name, webhookUrl, usePairingCode, phoneNumber);
            const instance = await handler.execute(command);
      
            ResponseHandler.created(res, instance.toJSON(), 'Instance created successfully', audit);
            
          } catch (error: any) {
            next(error)
          }
    }

}