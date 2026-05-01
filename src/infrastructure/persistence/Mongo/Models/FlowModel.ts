import { Schema, model, Document } from 'mongoose';

export interface FlowDocument extends Document {
  flowId: string;
  instanceId: string;
  name: string;
  version: number;
  isActive: boolean;
  start: string;
  nodes: any; // For MVP keep as any until DSL is formalized
  triggers?: { type: string; value: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const FlowSchema = new Schema<FlowDocument>({
  flowId: { type: String, required: true, index: true },
  instanceId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  version: { type: Number, required: true },
  isActive: { type: Boolean, default: true, index: true },
  start: { type: String, required: true },
  nodes: { type: Schema.Types.Mixed, required: true },
  triggers: { type: [Schema.Types.Mixed], default: [] },
}, { timestamps: true });

export const FlowModel = model<FlowDocument>('Flow', FlowSchema);
