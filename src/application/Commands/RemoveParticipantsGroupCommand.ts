export class RemoveParticipantsGroupCommand {
  constructor(
    public readonly instanceId: string,
    public readonly groupId: string,
    public readonly participants: string[]
  ) {}
}
