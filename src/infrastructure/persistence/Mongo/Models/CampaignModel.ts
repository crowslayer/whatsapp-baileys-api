import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaignDocument extends Document {
  campaignId: string;
  instanceId: string;
  name: string;
  description: string;
  message: string;
  recipients: [
    {
      jid: string;
      status: string;
      attempts: number;
      lastError: string;
    },
  ];
  status: string;
  currentIndex: number;
  lockedBy: string | null;
  lockedAt: Date | null;
  lockExpiresAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cronExpression?: string; // opcional
}

const CampaignSchema = new Schema<ICampaignDocument>(
  {
    campaignId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    instanceId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      min: 4,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      maxlength: 200,
    },

    status: {
      type: String,
      required: true,
      enum: ['draft', 'scheduled', 'running', 'paused', 'completed'],
      default: 'draft',
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxlength: 1000,
    },

    recipients: [
      {
        jid: { type: String, required: true },
        status: {
          type: String,
          enum: ['pending', 'sent', 'failed'],
          default: 'pending',
        },
        attempts: { type: Number, default: 0 },
        lastError: { type: String },
      },
    ],
    currentIndex: {
      type: Number,
      required: true,
      default: 0,
    },
    lockedBy: { type: String, default: null },
    lockedAt: { type: Date, default: null },
    lockExpiresAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cronExpression: { type: String, default: null },
  },
  { timestamps: true, collection: 'campaign_instances' }
);
// indicess
CampaignSchema.index({ status: 1, updatedAt: 1 });
CampaignSchema.index({ status: 1, scheduledAt: 1 });
CampaignSchema.index(
  { instanceId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'running' } }
);
CampaignSchema.index({ instanceId: 1, createdAt: -1 });

export const CampaignModel = mongoose.model<ICampaignDocument>('CampaignInstance', CampaignSchema);
