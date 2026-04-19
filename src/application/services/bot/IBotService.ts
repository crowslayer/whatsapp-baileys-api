export type BotInput = {
  instanceId: string;
  from: string;
  message: string;
  raw: any;
};

export interface IBotService {
  handleMessage(input: BotInput): Promise<void>;
}
