import { Document, Schema, model } from 'mongoose';

export interface IFlowSessionDocument extends Document {
  instanceId: string;
  chatId: string;
  currentFlowId?: string;
  currentNodeId?: string;
  variables?: any;
}

const FlowSessionSchema = new Schema<IFlowSessionDocument>(
  {
    instanceId: { type: String, required: true, index: true },
    chatId: { type: String, required: true, index: true },
    currentFlowId: { type: String, default: undefined },
    currentNodeId: { type: String, default: undefined },
    variables: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const FlowSessionModel = model<IFlowSessionDocument>('FlowSession', FlowSessionSchema);
