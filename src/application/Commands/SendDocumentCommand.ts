export class SendDocumentCommand {
  constructor(
    public readonly instanceId: string,
    public readonly to: string,
    public readonly document: Buffer,
    public readonly fileName: string,
    public readonly mimetype: string,
    public readonly caption?: string
  ) {}
}
