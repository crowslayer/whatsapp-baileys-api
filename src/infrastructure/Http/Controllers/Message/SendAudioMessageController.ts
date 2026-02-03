import { Request, Response, NextFunction } from "express";
import { Controller } from "../Controller";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { SendAudioCommand } from "@application/Commands/SendAudioCommand";
import { SendAudioHandler } from "@application/Handlers/SendAudioHandler";
import { AuditDataBuilder } from "@shared/infrastructure/AuditData";
import { NotFoundError } from "@shared/infrastructure/Error/NotFoundError";
import { ResponseHandler } from "@shared/infrastructure/ResponseHandler";

export class SendAudioMessageController implements Controller {

  constructor(
    private readonly repository: IWhatsAppInstanceRepository,
    private readonly connectionManager: BaileysConnectionManager
  ) { }

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instanceId } = req.params;
      const { to, ptt } = req.body;

      if (!req.file) {
        throw new NotFoundError('Audio file is required')
      }

      const audit = new AuditDataBuilder('SEND', 'AUDIO')
        .withResourceId(instanceId)
        .withRequest(req.ip, req.get('user-agent'))
        .withDetails({ to, ptt: ptt === 'true', fileSize: req.file.size })
        .build();

      const handler = new SendAudioHandler(this.repository, this.connectionManager);
      const command = new SendAudioCommand(
        instanceId,
        to,
        req.file.buffer,
        ptt === 'true',
        req.file.mimetype
      );
      await handler.execute(command);

      ResponseHandler.success(res, { sent: true }, 'Audio sent successfully', 200, audit);

    } catch (error) {
      next(error);
    }
  }
}