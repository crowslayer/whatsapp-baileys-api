export type BaseMessagePayload = {
  instanceId: string;
  chatId: string;
  messageId: string;
  from: string;
  timestamp: Date;
};

export type TextMessageContent = {
  messageType: 'text';
  text: string;
};

export type ImageMessageContent = {
  messageType: 'image';
  caption?: string;
  media: {
    mimeType?: string;
    fileName?: string;
    fileLength?: number;
  };
};

export type AudioMessageContent = {
  messageType: 'audio';
  media: {
    mimeType?: string;
    fileLength?: number;
    duration?: number;
    ptt?: boolean;
  };
};

export type MessageContent = TextMessageContent | ImageMessageContent | AudioMessageContent;

export type MessagePayload = BaseMessagePayload & {
  content: MessageContent;
};
