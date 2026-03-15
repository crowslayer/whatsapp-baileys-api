export class SendVideoCommand {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly video: Buffer,
    public readonly caption?: string,
    public readonly gifPlayback?: boolean,
    public readonly fileName?: string
  ) {}
}
