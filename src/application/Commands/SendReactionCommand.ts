export class SendReactionCommand {
  constructor(
    public readonly instanceId: string,
    public readonly messageId: string,
    public readonly emoji: string,
    public readonly chatId: string
  ) {}
}
