export interface IConversationState {
  instanceId: string;
  conversationId: string;
  currentFlowId?: string;
  currentNodeId?: string;
  variables: Record<string, unknown>;
}
