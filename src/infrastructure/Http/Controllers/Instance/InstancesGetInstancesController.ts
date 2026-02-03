import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { Controller } from "../Controller";
import { Request, Response, NextFunction } from "express";
import { ListInstancesHandler } from "@application/Handlers/ListInstancesHandler";
import { ListInstancesQuery } from "@application/Queries/ListInstancesQuery";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class InstancesGetInstancesController implements Controller{

    constructor(private readonly repository:IWhatsAppInstanceRepository){}

    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const audit = new AuditDataBuilder('LIST', 'INSTANCE')
              .withRequest(req.ip, req.get('user-agent'))
              .build();
      
            const handler = new ListInstancesHandler(this.repository);
            const query = new ListInstancesQuery();
            const instances = await handler.execute(query);
      
            const data = instances.map(i => i.toJSON());
      
            ResponseHandler.success(res, data, 'Instances retrieved successfully', 200, audit);
          } catch (error: any) {
            next(error);
            
          }
    }
}