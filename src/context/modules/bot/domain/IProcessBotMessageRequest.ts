export interface IProcessBotMessageRequest {
  instanceId: string;
  conversationId: string;
  messageId: string;
  senderId: string;
  text: string;
}
