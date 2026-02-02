import { SendMessageCommand } from "@application/Commands/SendMessageCommand";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { NotFoundError } from "@shared/infrastructure/Error/NotFoundError";
import { ValidationError } from "@shared/infrastructure/Error/ValidationError";


export class SendMessageHandler {
    constructor(
      private repository: IWhatsAppInstanceRepository,
      private connectionManager: BaileysConnectionManager
    ) {}
  
    async execute(command: SendMessageCommand): Promise<void> {
      const instance = await this.repository.findById(command.instanceId);
      if (!instance) {
        throw new NotFoundError(`Instance ${command.instanceId} not found`);
      }
  
      if (!instance.canSendMessages()) {
        throw new ValidationError([{field:'instance', message:`Instance ${command.instanceId} is not connected`}]);
      }
  
      const adapter = this.connectionManager.getConnection(command.instanceId);
      if (!adapter) {
        throw new ValidationError([{field:'instance', message:`Instance ${command.instanceId} adapter not found`}]);
      }
  
      await adapter.sendMessage(command.to, command.message);
    }
  }