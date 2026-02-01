import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppInstanceDocument extends Document {
  instanceId: string;
  name: string;
  status: string;
  phoneNumber?: string;
  qrCode?: string;
  qrText?: string;
  pairingCode?: string;
  webhookUrl?: string;
  sessionData?: any;
  lastConnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppInstanceSchema = new Schema<IWhatsAppInstanceDocument>(
  {
    instanceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      required: true,
      enum: ['disconnected', 'connecting', 'connected', 'qr_ready', 'pairing_code_ready', 'error'],
      default: 'disconnected',
    },
    phoneNumber: {
      type: String,
      sparse: true,
      index: true,
    },
    qrCode: String,
    qrText: String,
    pairingCode: String,
    webhookUrl: String,
    sessionData: Schema.Types.Mixed,
    lastConnectedAt: Date,
  },
  {
    timestamps: true,
    collection: 'whatsapp_instances',
  }
);

// Índices compuestos
WhatsAppInstanceSchema.index({ name: 1 }, { unique: true });
WhatsAppInstanceSchema.index({ status: 1, createdAt: -1 });

export const WhatsAppInstanceModel = mongoose.model<IWhatsAppInstanceDocument>(
  'WhatsAppInstance',
  WhatsAppInstanceSchema
);