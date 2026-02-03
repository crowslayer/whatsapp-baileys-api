import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";

export class InstanceDisconnectController implements Controller{

    constructor(
        private readonly connectionManager: BaileysConnectionManager
    ){}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { instanceId } = req.params;
      
            const audit = new AuditDataBuilder('DISCONNECT', 'INSTANCE')
              .withResourceId(instanceId)
              .withRequest(req.ip, req.get('user-agent'))
              .build();
      
            await this.connectionManager.disconnectInstance(instanceId);
      
            ResponseHandler.success(res, null, 'Instance disconnected successfully', 200, audit);
          } catch (error: any) {
            next(error);
            
          }
    }

}