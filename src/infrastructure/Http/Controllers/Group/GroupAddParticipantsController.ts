import { Request, Response, NextFunction } from "express";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { Controller } from "../Controller";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class GroupAddParticipantsController implements Controller{

    constructor(private readonly connectionManager: BaileysConnectionManager){}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { instanceId, groupId } = req.params;
            const { participants } = req.body;
      
            const audit = new AuditDataBuilder('ADD_PARTICIPANTS', 'GROUP')
              .withResourceId(groupId)
              .withRequest(req.ip, req.get('user-agent'))
              .withDetails({ instanceId, participantsCount: participants.length })
              .build();
      
            const adapter = this.connectionManager.getConnection(instanceId);
            if (!adapter) {
              ResponseHandler.badRequest(res, 'Instance not connected');
              return;
            }
      
            await adapter.addParticipantsToGroup(groupId, participants);
      
            return ResponseHandler.success(res, { added: true }, 'Participants added successfully', 200, audit);
            
          } catch (error: any) {
            next(error);
          }
    }

}