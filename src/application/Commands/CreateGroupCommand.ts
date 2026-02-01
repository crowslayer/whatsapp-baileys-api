export class CreateGroupCommand {
    constructor(
      public readonly instanceId: string,
      public readonly name: string,
      public readonly participants: string[]
    ) {}
  }