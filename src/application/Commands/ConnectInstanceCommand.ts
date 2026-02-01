export class ConnectInstanceCommand {
    constructor(
      public readonly instanceId: string,
      public readonly usePairingCode?: boolean,
      public readonly phoneNumber?: string
    ) {}
  }