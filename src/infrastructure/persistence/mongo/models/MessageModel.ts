import mongoose, { Document, Schema } from 'mongoose';

type MessageDirection = 'incoming' | 'outgoing';

type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact'
  | 'poll'
  | 'reaction'
  | 'forward';

export interface IMessageDocument extends Document {
  messageId: string;
  instanceId: string;
  chatId: string;

  direction: MessageDirection;
  messageType: MessageType;

  senderId: string;

  timestamp: Date;

  content: {
    text?: string;

    caption?: string;

    media?: {
      mimeType?: string;
      fileName?: string;
      fileLength?: number;
      duration?: number;
      ptt?: boolean;
    };

    location?: {
      latitude: number;
      longitude: number;
      name?: string;
      address?: string;
    };

    contacts?: Array<{
      displayName: string;
      vcard: string;
    }>;

    poll?: {
      name: string;
      values: string[];
      selectableCount: number;
    };

    reaction?: {
      emoji: string;
      targetMessageId: string;
    };

    forward?: {
      originalMessageId?: string;
    };
  };

  // Estado de entrega del mensaje saliente.
  // No necesariamente estará disponible para incoming.
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    messageId: {
      type: String,
      required: true,
    },

    instanceId: {
      type: String,
      required: true,
      index: true,
    },

    chatId: {
      type: String,
      required: true,
      index: true,
    },

    direction: {
      type: String,
      enum: ['incoming', 'outgoing'],
      required: true,
      index: true,
    },

    messageType: {
      type: String,
      enum: [
        'text',
        'image',
        'video',
        'audio',
        'document',
        'sticker',
        'location',
        'contact',
        'poll',
        'reaction',
        'forward',
      ],
      required: true,
      index: true,
    },

    senderId: {
      type: String,
      required: true,
      index: true,
    },

    timestamp: {
      type: Date,
      required: true,
      index: true,
    },

    content: {
      type: {
        text: { type: String },
        caption: { type: String },

        media: {
          mimeType: { type: String },
          fileName: { type: String },
          fileLength: { type: Number },
          duration: { type: Number },
          ptt: { type: Boolean },
        },

        location: {
          latitude: { type: Number },
          longitude: { type: Number },
          name: { type: String },
          address: { type: String },
        },

        contacts: [
          {
            displayName: { type: String },
            vcard: { type: String },
          },
        ],

        poll: {
          name: { type: String },
          values: [{ type: String }],
          selectableCount: { type: Number },
        },

        reaction: {
          emoji: { type: String },
          targetMessageId: { type: String },
        },

        forward: {
          originalMessageId: { type: String },
        },
      },
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    },
  },
  {
    timestamps: true,
    collection: 'messages',
  }
);

// Un mensaje de WhatsApp es único dentro de una instancia.
MessageSchema.index({ instanceId: 1, messageId: 1 }, { unique: true });

// Historial de un chat.
MessageSchema.index({
  instanceId: 1,
  chatId: 1,
  timestamp: -1,
});

// Historial filtrado por dirección.
MessageSchema.index({
  instanceId: 1,
  chatId: 1,
  direction: 1,
  timestamp: -1,
});

export const MessageModel = mongoose.model<IMessageDocument>('Message', MessageSchema);
