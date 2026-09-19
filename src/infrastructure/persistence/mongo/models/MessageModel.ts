import mongoose, { Document, Schema } from 'mongoose';

import { MessageDirection, MessageStatus, SentMessageContent } from '@domain/messages/MessageTypes';

export interface IMessageDocument extends Document {
  messageId: string;
  instanceId: string;
  chatId: string;

  direction: MessageDirection;

  senderId: string;

  timestamp: Date;

  content: SentMessageContent;

  status?: MessageStatus;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Contexto común para mensajes enviados.
 */
const MessageContextSchema = new Schema(
  {
    quotedMessageId: {
      type: String,
    },

    quotedParticipantId: {
      type: String,
    },

    quotedText: {
      type: String,
    },

    mentions: {
      type: [String],
    },

    isForwarded: {
      type: Boolean,
    },

    forwardingScore: {
      type: Number,
    },

    participant: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

/**
 * Media común.
 *
 * Se utiliza como subdocumento flexible porque no todos los
 * tipos multimedia tienen exactamente las mismas propiedades.
 */
const MediaSchema = new Schema(
  {
    mimeType: {
      type: String,
    },

    fileName: {
      type: String,
    },

    fileLength: {
      type: Number,
    },

    duration: {
      type: Number,
    },

    ptt: {
      type: Boolean,
    },

    storageKey: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const LocationSchema = new Schema(
  {
    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
    },

    address: {
      type: String,
    },

    url: {
      type: String,
    },

    accuracy: {
      type: Number,
    },

    speed: {
      type: Number,
    },

    degrees: {
      type: Number,
    },

    sequenceNumber: {
      type: Number,
    },
  },
  {
    _id: false,
  }
);

const ContactsSchema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
    },

    vcard: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const PollSchema = new Schema(
  {
    name: {
      type: String,
    },

    values: {
      type: [String],
    },

    selectableCount: {
      type: Number,
    },

    toAnnouncementGroup: {
      type: Boolean,
    },

    targetMessageId: {
      type: String,
    },

    selectedOptions: {
      type: [String],
    },
  },
  {
    _id: false,
  }
);

const ReactionSchema = new Schema(
  {
    emoji: {
      type: String,
      required: true,
    },

    targetMessageId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const ForwardSchema = new Schema(
  {
    originalMessageId: {
      type: String,
    },

    originalParticipantId: {
      type: String,
    },

    forwardingScore: {
      type: Number,
    },
  },
  {
    _id: false,
  }
);

const InviteSchema = new Schema(
  {
    groupJid: {
      type: String,
    },

    groupName: {
      type: String,
    },

    inviteCode: {
      type: String,
    },

    caption: {
      type: String,
    },

    expiration: {
      type: Number,
    },
  },
  {
    _id: false,
  }
);

const ButtonSchema = new Schema(
  {
    id: {
      type: String,
    },

    text: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const ListSchema = new Schema(
  {
    id: {
      type: String,
    },

    title: {
      type: String,
    },

    description: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const InteractiveSchema = new Schema(
  {
    type: {
      type: String,
    },

    body: {
      type: String,
    },

    header: {
      type: String,
    },

    footer: {
      type: String,
    },

    nativeFlowName: {
      type: String,
    },

    nativeFlowParamsJson: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const ProductSchema = new Schema(
  {
    productId: {
      type: String,
    },

    title: {
      type: String,
    },

    description: {
      type: String,
    },

    currencyCode: {
      type: String,
    },

    priceAmount: {
      type: Number,
    },

    retailerId: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const EventSchema = new Schema(
  {
    name: {
      type: String,
    },

    description: {
      type: String,
    },

    startTime: {
      type: Number,
    },

    endTime: {
      type: Number,
    },

    location: {
      type: String,
    },

    isCanceled: {
      type: Boolean,
    },
  },
  {
    _id: false,
  }
);
// eslint-disable-next-line
const ProtocolSchema = new Schema(
  {
    type: {
      type: Number,
    },

    keyId: {
      type: String,
    },

    targetMessageId: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

const CallSchema = new Schema(
  {
    callId: {
      type: String,
    },

    type: {
      type: String,
    },

    status: {
      type: String,
    },
  },
  {
    _id: false,
  }
);

/**
 * Content del mensaje.
 *
 * `messageType` funciona como discriminador lógico del union type
 * SentMessageContent.
 */
const MessageContentSchema = new Schema(
  {
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
        'live_location',
        'contact',
        'poll',
        'poll_result',
        'reaction',
        'forward',
        'group_invite',
        'button_reply',
        'list_reply',
        'interactive',
        'product',
        'event',
        'protocol',
        'call',
      ],
      required: true,
    },

    text: {
      type: String,
    },

    caption: {
      type: String,
    },

    viewOnce: {
      type: Boolean,
    },

    ptv: {
      type: Boolean,
    },

    media: {
      type: MediaSchema,
    },

    location: {
      type: LocationSchema,
    },

    contacts: {
      type: [ContactsSchema],
    },

    poll: {
      type: PollSchema,
    },

    reaction: {
      type: ReactionSchema,
    },

    forward: {
      type: ForwardSchema,
    },

    invite: {
      type: InviteSchema,
    },

    button: {
      type: ButtonSchema,
    },

    list: {
      type: ListSchema,
    },

    interactive: {
      type: InteractiveSchema,
    },

    product: {
      type: ProductSchema,
    },

    event: {
      type: EventSchema,
    },

    protocol: {
      type: ProtocolSchema,
    },

    call: {
      type: CallSchema,
    },

    context: {
      type: MessageContextSchema,
    },
  },
  {
    _id: false,
    strict: true,
  }
);

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
      type: MessageContentSchema,
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

/**
 * Un mensaje es único dentro de una instancia.
 */
MessageSchema.index(
  {
    instanceId: 1,
    messageId: 1,
  },
  {
    unique: true,
  }
);

/**
 * Historial de un chat.
 */
MessageSchema.index({
  instanceId: 1,
  chatId: 1,
  timestamp: -1,
  messageId: -1,
});

/**
 * Historial de un chat filtrado por dirección.
 */
MessageSchema.index({
  instanceId: 1,
  chatId: 1,
  direction: 1,
  timestamp: -1,
});

export const MessageModel = mongoose.model<IMessageDocument>('Message', MessageSchema);
