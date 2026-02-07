export class SendImageCommand {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly image: Buffer,
    public readonly caption?: string,
    public readonly fileName?: string
  ) {}
}
