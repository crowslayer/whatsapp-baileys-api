export class SendMessageCommand {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly message: string
  ) {}
}
