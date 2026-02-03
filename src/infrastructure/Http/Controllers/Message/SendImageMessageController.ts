import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { SendImageCommand } from "@application/Commands/SendImageCommand";
import { SendImageHandler } from "@application/Handlers/SendImageHandler";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { NotFoundError } from "@shared/infrastructure/Error/NotFoundError";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class SendImageMessageController implements Controller {

  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) { }

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, caption, fileName } = req.body;

      if (!req.file) {
        throw new NotFoundError('Image file is required');
      }

      const audit = new AuditDataBuilder('SEND', 'IMAGE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, fileSize: req.file.size })
        .build();

      const handler = new SendImageHandler(this.repository, this.connectionManager);
      const command = new SendImageCommand(instanceId, to, req.file.buffer, caption, fileName);
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Image sent successfully', 200, audit);

    } catch (error) {
      next(error);
    }
  }
}