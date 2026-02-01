export class CreateInstanceCommand {
    constructor(
      public readonly name: string,
      public readonly webhookUrl?: string,
      public readonly usePairingCode?: boolean,
      public readonly phoneNumber?: string
    ) {}
  }