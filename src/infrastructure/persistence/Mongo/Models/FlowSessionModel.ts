import { Schema, model, Document } from 'mongoose';

export interface FlowSessionDocument extends Document {
  instanceId: string;
  chatId: string;
  currentFlowId?: string;
  currentNodeId?: string;
  variables?: any;
}

const FlowSessionSchema = new Schema<FlowSessionDocument>({
  instanceId: { type: String, required: true, index: true },
  chatId: { type: String, required: true, index: true },
  currentFlowId: { type: String, default: undefined },
  currentNodeId: { type: String, default: undefined },
  variables: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const FlowSessionModel = model<FlowSessionDocument>('FlowSession', FlowSessionSchema);
