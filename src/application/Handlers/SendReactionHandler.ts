import { SendReactionCommand } from "@application/Commands/SendReactionCommand";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { NotFoundError, ValidationError } from "@shared/infrastructure/ErrorHandler";

export class SendReactionHandler {
    constructor(
      private repository: IWhatsAppInstanceRepository,
      private connectionManager: BaileysConnectionManager
    ) {}
  
    async execute(command: SendReactionCommand): Promise<void> {
      const instance = await this.repository.findById(command.instanceId);
      if (!instance) {
        throw new NotFoundError(`Instance ${command.instanceId} not found`);
      }
  
      if (!instance.canSendMessages()) {
        throw new ValidationError(`Instance ${command.instanceId} is not connected`);
      }
  
      const adapter = this.connectionManager.getConnection(command.instanceId);
      if (!adapter) {
        throw new ValidationError(`Instance ${command.instanceId} adapter not found`);
      }
  
      await adapter.sendReaction(command.chatId, command.messageId, command.emoji);
    }
  }