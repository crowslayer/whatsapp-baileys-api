export interface IConversationState {
  instanceId: string;
  chatId: string;

  currentFlowId?: string;
  currentNodeId?: string;

  variables: Record<string, any>;
}
