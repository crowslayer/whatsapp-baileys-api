export type BaseMessagePayload = {
  instanceId: string;
  chatId: string;
  messageId: string;
  senderId: string;
  timestamp: Date;
};

export type MessagePayload = BaseMessagePayload & {
  content: SentMessageContent;
};

export interface ISentMessage {
  messageId: string;
  chatId: string;
  timestamp: Date;
  content: SentMessageContent;
}

export type SentMessageContent =
  | SentTextContent
  | SentImageContent
  | SentVideoContent
  | SentAudioContent
  | SentDocumentContent
  | SentStickerContent
  | SentLocationContent
  | SentLiveLocationContent
  | SentContactContent
  | SentPollContent
  | SentPollResultContent
  | SentReactionContent
  | SentForwardContent
  | SentGroupInviteContent
  | SentButtonReplyContent
  | SentListReplyContent
  | SentInteractiveContent
  | SentProductContent
  | SentEventContent
  | SentProtocolContent
  | SentCallContent;

export type MessageContext = {
  quotedMessageId?: string;
  quotedParticipantId?: string;
  quotedText?: string;
  mentions?: string[];
  isForwarded?: boolean;
  forwardingScore?: number;
  participant?: string;
};

export type SentTextContent = {
  messageType: 'text';
  text: string;
  context?: MessageContext;
};

export type SentImageContent = {
  messageType: 'image';
  caption?: string;
  viewOnce?: boolean;
  media: {
    mimeType?: string;
    fileName?: string;
    fileLength?: number;
    storageKey?: string;
  };
  context?: MessageContext;
};

export type SentVideoContent = {
  messageType: 'video';
  caption?: string;
  ptv?: boolean;
  viewOnce?: boolean;
  media: {
    mimeType?: string;
    fileName?: string;
    fileLength?: number;
    duration?: number;
    storageKey?: string;
  };
  context?: MessageContext;
};

export type SentAudioContent = {
  messageType: 'audio';
  viewOnce?: boolean;
  media: {
    mimeType?: string;
    fileName?: string;
    fileLength?: number;
    duration?: number;
    ptt?: boolean;
    storageKey?: string;
  };
  context?: MessageContext;
};

export type SentDocumentContent = {
  messageType: 'document';
  caption?: string;
  viewOnce?: boolean;
  media: {
    mimeType?: string;
    fileName?: string;
    fileLength?: number;
    storageKey?: string;
  };
  context?: MessageContext;
};

export type SentStickerContent = {
  messageType: 'sticker';
  media: {
    mimeType?: string;
    fileLength?: number;
    storageKey?: string;
  };
  context?: MessageContext;
};

export type SentLocationContent = {
  messageType: 'location';
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
    url?: string;
  };
  context?: MessageContext;
};

export type SentLiveLocationContent = {
  messageType: 'live_location';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    degrees?: number;
    sequenceNumber?: number;
  };
  context?: MessageContext;
};

export type SentContactContent = {
  messageType: 'contact';
  contacts: Array<{
    displayName: string;
    vcard: string;
  }>;
  context?: MessageContext;
};

export type SentPollContent = {
  messageType: 'poll';
  poll: {
    name: string;
    values: string[];
    selectableCount: number;
    toAnnouncementGroup?: boolean;
  };
  context?: MessageContext;
};

export type SentPollResultContent = {
  messageType: 'poll_result';
  poll: {
    targetMessageId: string;
    selectedOptions: string[];
  };
  context?: MessageContext;
};

export type SentReactionContent = {
  messageType: 'reaction';
  reaction: {
    emoji: string;
    targetMessageId: string;
  };
  context?: MessageContext;
};

export type SentForwardContent = {
  messageType: 'forward';
  forward: {
    originalMessageId?: string;
    originalParticipantId?: string;
    forwardingScore?: number;
  };

  context?: MessageContext;
};

export type SentGroupInviteContent = {
  messageType: 'group_invite';
  invite: {
    groupJid?: string;
    groupName?: string;
    inviteCode?: string;
    caption?: string;
    expiration?: number;
  };
  context?: MessageContext;
};

export type SentButtonReplyContent = {
  messageType: 'button_reply';
  button: {
    id?: string;
    text?: string;
  };
  context?: MessageContext;
};

export type SentListReplyContent = {
  messageType: 'list_reply';
  list: {
    id?: string;
    title?: string;
    description?: string;
  };
  context?: MessageContext;
};

export type SentInteractiveContent = {
  messageType: 'interactive';
  interactive: {
    type?: string;
    body?: string;
    header?: string;
    footer?: string;
    nativeFlowName?: string;
    nativeFlowParamsJson?: string;
  };
  context?: MessageContext;
};

export type SentProductContent = {
  messageType: 'product';
  product: {
    productId?: string;
    title?: string;
    description?: string;
    currencyCode?: string;
    priceAmount?: number;
    retailerId?: string;
  };
  context?: MessageContext;
};

export type SentEventContent = {
  messageType: 'event';
  event: {
    name?: string;
    description?: string;
    startTime?: number;
    endTime?: number;
    location?: string;
    isCanceled?: boolean;
  };

  context?: MessageContext;
};

export type SentProtocolContent = {
  messageType: 'protocol';
  protocol: {
    type?: number;
    keyId?: string;
    targetMessageId?: string;
  };
  context?: MessageContext;
};

export type SentCallContent = {
  messageType: 'call';
  call: {
    callId?: string;
    type?: string;
    status?: string;
  };
  context?: MessageContext;
};

export type MessageDirection = 'incoming' | 'outgoing';

export type MessageType = SentMessageContent['messageType'];

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
