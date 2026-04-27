import mongoose, { Document, Schema } from 'mongoose';

import { ICampaignRecipient } from '@domain/campaign/CampaignAggregate';

export interface ICampaignDocument extends Document {
  campaignId: string;
  instanceId: string;
  name: string;
  description: string;
  message: string;
  recipients: ICampaignRecipient[];
  status: string;

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

    recipients: {
      type: [
        {
          jid: String,
          status: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
          },
          attempts: { type: Number, default: 0 },
          lastError: String,
          retryAt: Date,
        },
      ],
      default: [],
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
CampaignSchema.index({ instanceId: 1, status: 1 });
CampaignSchema.index({ 'recipients.retryAt': 1 });
CampaignSchema.index({ status: 1, 'recipients.retryAt': 1 });
CampaignSchema.index({ status: 1, 'recipients.status': 1, 'recipients.retryAt': 1 });
CampaignSchema.index({ instanceId: 1, createdAt: -1 });

export const CampaignModel = mongoose.model<ICampaignDocument>('CampaignInstance', CampaignSchema);
