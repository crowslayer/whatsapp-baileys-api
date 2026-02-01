export class SendContactCommand {
    constructor(
      public readonly instanceId: string,
      public readonly to: string,
      public readonly contacts: Array<{
        displayName: string;
        vcard: string;
      }>
    ) {}
  }