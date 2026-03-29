import mongoose, { Document, Schema } from 'mongoose';

export interface IChatDocument extends Document {
  chatId: string;
  instanceId: string;
  type: 'chat' | 'group';
  name: string;
  phoneNumber?: string;
  unreadCount: number;
  lastMessageTimestamp?: Date;
  isArchived: boolean;
  isMuted: boolean;
  participantCount?: number;
  description?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChatDocument>(
  {
    chatId: { type: String, required: true },
    instanceId: { type: String, required: true, index: true },
    type: { type: String, enum: ['chat', 'group'], required: true, index: true },
    name: { type: String, required: true },
    phoneNumber: { type: String },
    unreadCount: { type: Number, default: 0 },
    lastMessageTimestamp: { type: Date },
    isArchived: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    participantCount: { type: Number },
    description: { type: String },
    profilePictureUrl: { type: String },
  },
  {
    timestamps: true,
    collection: 'chats',
  }
);

// Compound unique index: one chat per instance
ChatSchema.index({ chatId: 1, instanceId: 1 }, { unique: true });

// For listing chats sorted by most recent activity
ChatSchema.index({ instanceId: 1, lastMessageTimestamp: -1 });

export const ChatModel = mongoose.model<IChatDocument>('Chat', ChatSchema);
