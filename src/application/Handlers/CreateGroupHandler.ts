import { CreateGroupCommand } from "@application/Commands/CreateGroupCommand";
import { IWhatsAppInstanceRepository } from "@domain/Repositories/IWhatsAppInstanceRepository";
import { BaileysConnectionManager } from "@infrastructure/Baileys/BaileysConnectionManager";
import { NotFoundError, ValidationError } from "@shared/infrastructure/ErrorHandler";

export class CreateGroupHandler {
    constructor(
      private repository: IWhatsAppInstanceRepository,
      private connectionManager: BaileysConnectionManager
    ) {}
  
    async execute(command: CreateGroupCommand): Promise<string> {
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
  
      const groupId = await adapter.createGroup(command.name, command.participants);
      return groupId;
    }
  }
  
  