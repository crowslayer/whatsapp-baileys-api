export class SendAudioCommand {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly audio: Buffer,
    public readonly ptt?: boolean, // Push to talk (nota de voz)
    public readonly mimetype?: string
  ) {}
}
