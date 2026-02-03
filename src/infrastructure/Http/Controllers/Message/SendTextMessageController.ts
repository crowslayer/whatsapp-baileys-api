import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { SendMessageCommand } from "@application/Commands/SendMessageCommand";
import { SendMessageHandler } from "@application/Handlers/SendMessageHandler";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class SendTextMessageController implements Controller {

  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) { }

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, message } = req.body;

      const audit = new AuditDataBuilder('SEND', 'MESSAGE')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, messageLength: message.length })
        .build();

      const handler = new SendMessageHandler(this.repository, this.connectionManager);
      const command = new SendMessageCommand(instanceId, to, message);
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Message sent successfully', 200, audit);

    } catch (error) {
      next(error);
    }
  }
}