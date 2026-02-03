import { Request, Response, NextFunction } from "express";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { Controller } from "../Controller";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { CreateGroupCommand } from "@application/Commands/CreateGroupCommand";
import { CreateGroupHandler } from "@application/Handlers/CreateGroupHandler";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class GroupCreateController implements Controller{

    constructor(private readonly repository:IWhatsAppInstanceRepository,
        private readonly connectionManager: BaileysConnectionManager
    ){}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { instanceId } = req.params;
            const { name, participants } = req.body;
      
            const audit = new AuditDataBuilder('CREATE', 'GROUP')
              .withResourceId(instanceId)
              .withRequest(req.ip, req.get('user-agent'))
              .withDetails({ groupName: name, participantsCount: participants.length })
              .build();
      
            const handler = new CreateGroupHandler(this.repository, this.connectionManager);
            const command = new CreateGroupCommand(instanceId, name, participants);
            const groupId = await handler.execute(command);
      
            return ResponseHandler.created(res, { groupId }, 'Group created successfully', audit);
            
          } catch (error) {
            next(error)
          }
    
    }
}