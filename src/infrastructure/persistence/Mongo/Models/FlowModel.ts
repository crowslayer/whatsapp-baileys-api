import { Document, Schema, model } from 'mongoose';

const BaseNodeSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false, discriminatorKey: 'type' }
);

const MessageNodeSchema = new Schema(
  {
    text: { type: String, required: true },
    next: { type: String, default: null },
  },
  { _id: false }
);

const InputNodeSchema = new Schema(
  {
    variable: { type: String, required: true },
    next: { type: String, default: null },
  },
  { _id: false }
);

const ConditionNodeSchema = new Schema(
  {
    variable: { type: String, required: true },
    equals: { type: String, required: true },
    ifTrue: { type: String, required: true },
    ifFalse: { type: String, required: true },
  },
  { _id: false }
);

const DelayNodeSchema = new Schema(
  {
    ms: { type: Number, required: true },
    next: { type: String, default: null },
  },
  { _id: false }
);

const AINodeSchema = new Schema(
  {
    prompt: { type: String, required: true },
    saveAs: { type: String },
    next: { type: String, default: null },
  },
  { _id: false }
);

// ---- Nodo con discriminadores ----

const NodeSchema = new Schema({}, { _id: false, discriminatorKey: 'type' });

NodeSchema.discriminator('message', MessageNodeSchema);
NodeSchema.discriminator('input', InputNodeSchema);
NodeSchema.discriminator('condition', ConditionNodeSchema);
NodeSchema.discriminator('delay', DelayNodeSchema);
NodeSchema.discriminator('ai', AINodeSchema);

// ---- Trigger ----

const TriggerSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['keyword', 'contains'],
      required: true,
    },
    value: { type: String, required: true },
  },
  { _id: false }
);

// ---- Documento principal ----

export interface IFlowDocument extends Document {
  flowId: string;
  instanceId: string;
  name: string;
  version: number;
  isActive: boolean;
  start: string;
  nodes: Record<string, any>;
  triggers?: { type: 'keyword' | 'contains'; value: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const FlowSchema = new Schema<IFlowDocument>(
  {
    flowId: { type: String, required: true, index: true },
    instanceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    version: { type: Number, required: true },
    isActive: { type: Boolean, default: true, index: true },
    start: { type: String, required: true },
    nodes: {
      type: Map,
      of: NodeSchema,
      required: true,
    },

    triggers: { type: [TriggerSchema], default: [] },
  },
  { timestamps: true }
);

// FlowSchema.index({ instanceId: 1 });
FlowSchema.index({ instanceId: 1, isActive: 1 });
FlowSchema.index({ instanceId: 1, 'triggers.value': 1 });

export const FlowModel = model<IFlowDocument>('Flow', FlowSchema);
