export interface IFlowExecutionState {
  currentFlowId?: string;
  currentNodeId?: string;
  variables?: Record<string, any>;
}

export interface IFlowSessionStore {
  getSession(instanceId: string, chatId: string): Promise<IFlowExecutionState | null>;
  setSession(instanceId: string, chatId: string, state: IFlowExecutionState): Promise<void>;
  updateSession(
    instanceId: string,
    chatId: string,
    updater: (current: IFlowExecutionState | null) => IFlowExecutionState
  ): Promise<void>;
  clearSession(instanceId: string, chatId: string): Promise<void>;
}
