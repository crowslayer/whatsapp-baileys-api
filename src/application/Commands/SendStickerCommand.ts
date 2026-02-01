export class SendStickerCommand {
    constructor(
      public readonly instanceId: string,
      public readonly to: string,
      public readonly sticker: Buffer
    ) {}
  }