import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class InstanceDeleteController implements Controller{

    constructor(
        private repository: IWhatsAppInstanceRepository,
        private connectionManager: BaileysConnectionManager
    ){}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { instanceId } = req.params;
      
            const audit = new AuditDataBuilder('DELETE', 'INSTANCE')
              .withResourceId(instanceId)
              .withRequest(req.ip, req.get('user-agent'))
              .build();
      
            await this.connectionManager.logoutInstance(instanceId);
            await this.repository.delete(instanceId);
      
            ResponseHandler.success(res, null, 'Instance deleted successfully', 200, audit);
          } catch (error: any) {
            next(error);
            
          }
    }
}