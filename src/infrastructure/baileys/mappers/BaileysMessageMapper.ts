import { WAMessage, WAMessageContent } from '@whiskeysockets/baileys/lib/Types/Message';

import { MessageContext, MessagePayload, SentMessageContent } from '@domain/messages/MessageTypes';

export class BaileysMessageMapper {
  static toIncomingMessage(instanceId: string, message: WAMessage): MessagePayload | null {
    if (message.key.fromMe) {
      return null;
    }

    const content = BaileysMessageMapper.mapContent(message);
    const senderId = BaileysMessageMapper.resolveSenderId(message) ?? instanceId;

    if (content === null) return null;

    return {
      instanceId,
      messageId: message.key.id ?? '',
      chatId: message.key.remoteJid ?? message.key.remoteJidAlt ?? '',
      senderId,
      timestamp: new Date(Number(message.messageTimestamp) * 1000),
      content,
    };
  }

  private static resolveSenderId(message: WAMessage): string | null {
    const key = message.key;

    // Grupo
    if (key.remoteJid?.endsWith('@g.us')) {
      return key.participantAlt ?? key.participant ?? null;
    }

    // Chat privado
    return key.remoteJidAlt ?? key.remoteJid ?? null;
  }

  private static mapContent(message: WAMessage): SentMessageContent | null {
    const msg = message.message;

    if (!msg) {
      return null;
    }

    const context = BaileysMessageMapper.mapContext(message);

    const viewOnceMessage =
      msg.viewOnceMessage?.message ??
      msg.viewOnceMessageV2?.message ??
      msg.viewOnceMessageV2Extension?.message;

    if (viewOnceMessage) {
      return BaileysMessageMapper.mapContentFromMessage(viewOnceMessage, context, true);
    }

    // ephemeralMessage
    if (msg.ephemeralMessage?.message) {
      return BaileysMessageMapper.mapContentFromMessage(msg.ephemeralMessage.message, context);
    }

    // documentWithCaptionMessage
    if (msg.documentWithCaptionMessage?.message) {
      return BaileysMessageMapper.mapContentFromMessage(
        msg.documentWithCaptionMessage.message,
        context
      );
    }

    return BaileysMessageMapper.mapContentFromMessage(msg, context);
  }

  private static mapContentFromMessage(
    msg: WAMessageContent,
    context?: MessageContext,
    viewOnce = false
  ): SentMessageContent | null {
    return (
      BaileysMessageMapper.mapText(msg, context) ??
      BaileysMessageMapper.mapImage(msg, context, viewOnce) ??
      BaileysMessageMapper.mapVideo(msg, context, viewOnce) ??
      BaileysMessageMapper.mapAudio(msg, context, viewOnce) ??
      BaileysMessageMapper.mapDocument(msg, context, viewOnce) ??
      BaileysMessageMapper.mapSticker(msg, context) ??
      BaileysMessageMapper.mapLocation(msg, context) ??
      BaileysMessageMapper.mapLiveLocation(msg, context) ??
      BaileysMessageMapper.mapContacts(msg, context) ??
      BaileysMessageMapper.mapPoll(msg, context) ??
      BaileysMessageMapper.mapPollResult(msg, context) ??
      BaileysMessageMapper.mapReaction(msg, context) ??
      BaileysMessageMapper.mapForward(msg, context) ??
      BaileysMessageMapper.mapGroupInvite(msg, context) ??
      BaileysMessageMapper.mapButtonReply(msg, context) ??
      BaileysMessageMapper.mapListReply(msg, context) ??
      BaileysMessageMapper.mapInteractive(msg, context) ??
      BaileysMessageMapper.mapProduct(msg, context) ??
      BaileysMessageMapper.mapEvent(msg, context) ??
      BaileysMessageMapper.mapProtocol(msg, context) ??
      BaileysMessageMapper.mapCall(msg, context)
    );
  }
  // eslint-disable-next-line
  private static mapContext(message: WAMessage): MessageContext | undefined {
    const msg = message.message;

    if (!msg) {
      return undefined;
    }

    const contextInfo =
      msg.extendedTextMessage?.contextInfo ??
      msg.imageMessage?.contextInfo ??
      msg.videoMessage?.contextInfo ??
      msg.audioMessage?.contextInfo ??
      msg.documentMessage?.contextInfo ??
      msg.stickerMessage?.contextInfo ??
      msg.locationMessage?.contextInfo ??
      msg.liveLocationMessage?.contextInfo ??
      msg.contactMessage?.contextInfo ??
      msg.contactsArrayMessage?.contextInfo ??
      msg.pollCreationMessage?.contextInfo ??
      msg.pollCreationMessageV2?.contextInfo ??
      msg.pollCreationMessageV3?.contextInfo ??
      msg.pollResultSnapshotMessage?.contextInfo ??
      // msg.reactionMessage?.contextInfo ??
      msg.buttonsMessage?.contextInfo ??
      msg.buttonsResponseMessage?.contextInfo ??
      msg.listMessage?.contextInfo ??
      msg.listResponseMessage?.contextInfo ??
      msg.interactiveMessage?.contextInfo ??
      msg.productMessage?.contextInfo ??
      msg.eventMessage?.contextInfo;

    if (!contextInfo) {
      return undefined;
    }

    const quotedMessage = contextInfo.quotedMessage;

    let quotedText: string | undefined;

    if (quotedMessage) {
      quotedText = String(
        quotedMessage.conversation ??
          quotedMessage.extendedTextMessage?.text ??
          quotedMessage.imageMessage?.caption ??
          quotedMessage.videoMessage?.caption ??
          quotedMessage.documentMessage?.caption
      );
    }

    const mentions = contextInfo.mentionedJid ?? undefined;

    const context: MessageContext = {
      quotedMessageId: contextInfo.stanzaId ?? undefined,
      quotedParticipantId: contextInfo.participant ?? undefined,
      quotedText,
      mentions,
      isForwarded: contextInfo.isForwarded === true ? true : undefined,
      forwardingScore:
        contextInfo.forwardingScore != null ? Number(contextInfo.forwardingScore) : undefined,
      participant: message.key.participant ?? message.key.participantAlt ?? undefined,
    };

    const hasContext = Object.values(context).some(
      (value) => value !== undefined && (!Array.isArray(value) || value.length > 0)
    );

    return hasContext ? context : undefined;
  }

  private static mapText(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    if (msg.conversation) {
      return {
        messageType: 'text',
        text: msg.conversation,
        context,
      };
    }

    const text = msg.extendedTextMessage?.text;

    if (!text) {
      return null;
    }

    return {
      messageType: 'text',
      text,
      context,
    };
  }

  private static mapImage(
    msg: WAMessageContent,
    context?: MessageContext,
    viewOnce = false
  ): SentMessageContent | null {
    const image = msg.imageMessage;

    if (!image) {
      return null;
    }

    return {
      messageType: 'image',
      caption: image.caption ?? undefined,
      viewOnce: viewOnce || undefined,
      media: {
        mimeType: image.mimetype ?? undefined,
        // fileName: image.fileName ?? undefined,
        fileLength: image.fileLength != null ? Number(image.fileLength) : undefined,
        storageKey: image.directPath ?? undefined,
      },
      context,
    };
  }

  private static mapVideo(
    msg: WAMessageContent,
    context?: MessageContext,
    viewOnce = false
  ): SentMessageContent | null {
    const video = msg.videoMessage;

    if (!video) {
      return null;
    }

    return {
      messageType: 'video',
      caption: video.caption ?? undefined,
      // ptv: video.ptv ?? undefined,
      viewOnce: viewOnce || undefined,
      media: {
        mimeType: video.mimetype ?? undefined,
        // fileName: video.fileName ?? undefined,
        fileLength: video.fileLength != null ? Number(video.fileLength) : undefined,
        duration: video.seconds != null ? Number(video.seconds) : undefined,
        storageKey: video.directPath ?? undefined,
      },
      context,
    };
  }

  private static mapAudio(
    msg: WAMessageContent,
    context?: MessageContext,
    viewOnce = false
  ): SentMessageContent | null {
    const audio = msg.audioMessage;

    if (!audio) {
      return null;
    }

    return {
      messageType: 'audio',
      viewOnce: viewOnce || undefined,
      media: {
        mimeType: audio.mimetype ?? undefined,
        // fileName: audio.fileName ?? undefined,
        fileLength: audio.fileLength != null ? Number(audio.fileLength) : undefined,
        duration: audio.seconds != null ? Number(audio.seconds) : undefined,
        ptt: audio.ptt ?? undefined,
        storageKey: audio.directPath ?? undefined,
      },
      context,
    };
  }

  private static mapDocument(
    msg: WAMessageContent,
    context?: MessageContext,
    viewOnce = false
  ): SentMessageContent | null {
    const document = msg.documentMessage;

    if (!document) {
      return null;
    }

    return {
      messageType: 'document',
      caption: document.caption ?? undefined,
      viewOnce: viewOnce || undefined,
      media: {
        mimeType: document.mimetype ?? undefined,
        fileName: document.fileName ?? undefined,
        fileLength: document.fileLength != null ? Number(document.fileLength) : undefined,
        storageKey: document.directPath ?? undefined,
      },
      context,
    };
  }

  private static mapSticker(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const sticker = msg.stickerMessage;

    if (!sticker) {
      return null;
    }

    return {
      messageType: 'sticker',
      media: {
        mimeType: sticker.mimetype ?? undefined,
        fileLength: sticker.fileLength != null ? Number(sticker.fileLength) : undefined,
        storageKey: sticker.directPath ?? undefined,
      },
      context,
    };
  }

  private static mapLocation(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const location = msg.locationMessage;

    if (!location) {
      return null;
    }

    if (location.degreesLatitude == null || location.degreesLongitude == null) {
      return null;
    }

    return {
      messageType: 'location',
      location: {
        latitude: Number(location.degreesLatitude),
        longitude: Number(location.degreesLongitude),
        name: location.name ?? undefined,
        address: location.address ?? undefined,
        url: location.url ?? undefined,
      },
      context,
    };
  }

  private static mapLiveLocation(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const location = msg.liveLocationMessage;

    if (!location) {
      return null;
    }

    if (location.degreesLatitude == null || location.degreesLongitude == null) {
      return null;
    }

    return {
      messageType: 'live_location',
      location: {
        latitude: Number(location.degreesLatitude),
        longitude: Number(location.degreesLongitude),
        accuracy: location.accuracyInMeters != null ? Number(location.accuracyInMeters) : undefined,
        speed: location.speedInMps != null ? Number(location.speedInMps) : undefined,
        degrees:
          location.degreesClockwiseFromMagneticNorth != null
            ? Number(location.degreesClockwiseFromMagneticNorth)
            : undefined,

        sequenceNumber:
          location.sequenceNumber != null ? Number(location.sequenceNumber) : undefined,
      },
      context,
    };
  }

  private static mapContacts(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    if (msg.contactMessage) {
      return {
        messageType: 'contact',
        contacts: [
          {
            displayName: msg.contactMessage.displayName ?? '',
            vcard: msg.contactMessage.vcard ?? '',
          },
        ],
        context,
      };
    }

    if (msg.contactsArrayMessage) {
      return {
        messageType: 'contact',
        contacts:
          msg.contactsArrayMessage.contacts?.map((contact) => ({
            displayName: contact.displayName ?? '',
            vcard: contact.vcard ?? '',
          })) ?? [],
        context,
      };
    }
    return null;
  }
  private static mapPoll(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const poll = msg.pollCreationMessage ?? msg.pollCreationMessageV2 ?? msg.pollCreationMessageV3;

    if (!poll) {
      return null;
    }

    return {
      messageType: 'poll',
      poll: {
        name: poll.name ?? '',
        values: poll.options?.map((option) => option.optionName ?? '') ?? [],
        selectableCount:
          poll.selectableOptionsCount != null ? Number(poll.selectableOptionsCount) : 0,
      },
      context,
    };
  }

  private static mapPollResult(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const poll = msg.pollUpdateMessage;

    if (!poll) {
      return null;
    }

    const selectedOptions: string[] = []; // poll.vote?.selectedOptions ?? [];

    return {
      messageType: 'poll_result',
      poll: {
        targetMessageId: poll.pollCreationMessageKey?.id ?? '',
        selectedOptions,
        // selectedOptions: selectedOptions.map((option) => Buffer.from(option).toString('base64')),
      },
      context,
    };
  }
  private static mapReaction(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const reaction = msg.reactionMessage;

    if (!reaction) {
      return null;
    }

    return {
      messageType: 'reaction',
      reaction: {
        emoji: reaction.text ?? '',
        targetMessageId: reaction.key?.id ?? '',
      },
      context,
    };
  }

  private static mapForward(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const contextInfo = msg.extendedTextMessage?.contextInfo;

    if (!contextInfo?.isForwarded) {
      return null;
    }

    return {
      messageType: 'forward',
      forward: {
        originalMessageId: contextInfo.stanzaId ?? undefined,
        originalParticipantId: contextInfo.participant ?? undefined,
        forwardingScore:
          contextInfo.forwardingScore != null ? Number(contextInfo.forwardingScore) : undefined,
      },
      context,
    };
  }

  private static mapGroupInvite(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const invite = msg.groupInviteMessage;

    if (!invite) {
      return null;
    }

    return {
      messageType: 'group_invite',
      invite: {
        groupJid: invite.groupJid ?? undefined,
        groupName: invite.groupName ?? undefined,
        inviteCode: invite.inviteCode ?? undefined,
        caption: invite.caption ?? undefined,
        expiration: invite.inviteExpiration != null ? Number(invite.inviteExpiration) : undefined,
      },
      context,
    };
  }

  private static mapButtonReply(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const reply = msg.buttonsResponseMessage;

    if (!reply) {
      return null;
    }

    return {
      messageType: 'button_reply',
      button: {
        id: reply.selectedButtonId ?? undefined,
        text: reply.selectedDisplayText ?? undefined,
      },
      context,
    };
  }

  private static mapListReply(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const reply = msg.listResponseMessage;

    if (!reply) {
      return null;
    }

    const row = reply.singleSelectReply?.selectedRowId;

    return {
      messageType: 'list_reply',
      list: {
        id: row ?? undefined,
        title: reply.title ?? undefined,
        description: reply.description ?? undefined,
      },
      context,
    };
  }

  private static mapInteractive(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const interactive = msg.interactiveMessage;

    if (!interactive) {
      return null;
    }

    return {
      messageType: 'interactive',
      interactive: {
        type: interactive.nativeFlowMessage ? 'native_flow' : undefined,
        body: interactive.body?.text ?? undefined,
        header:
          interactive.header?.title ??
          interactive.header?.documentMessage?.title ??
          interactive.header?.imageMessage?.caption ??
          interactive.header?.videoMessage?.caption ??
          undefined,
        footer: interactive.footer?.text ?? undefined,
        nativeFlowName: interactive.nativeFlowMessage?.buttons?.[0]?.name ?? undefined,
        nativeFlowParamsJson:
          interactive.nativeFlowMessage?.buttons?.[0]?.buttonParamsJson ?? undefined,
      },
      context,
    };
  }

  private static mapProduct(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const product = msg.productMessage;

    if (!product) {
      return null;
    }

    const productInfo = product.product?.productImage;

    return {
      messageType: 'product',
      product: {
        productId: product.product?.productId ?? undefined,
        title: product.product?.title ?? undefined,
        description: product.product?.description ?? undefined,
        currencyCode: product.product?.currencyCode ?? undefined,
        priceAmount:
          product.product?.priceAmount1000 != null
            ? Number(product.product.priceAmount1000) / 1000
            : undefined,
        retailerId: product.product?.retailerId ?? undefined,
      },
      context,
    };
  }

  private static mapEvent(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const event = msg.eventMessage;

    if (!event) {
      return null;
    }

    return {
      messageType: 'event',
      event: {
        name: event.name ?? undefined,
        description: event.description ?? undefined,
        startTime: event.startTime != null ? Number(event.startTime) : undefined,
        endTime: event.endTime != null ? Number(event.endTime) : undefined,
        location: event.location?.name ?? undefined,
        isCanceled: event.isCanceled ?? undefined,
      },
      context,
    };
  }

  private static mapProtocol(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const protocol = msg.protocolMessage;

    if (!protocol) {
      return null;
    }

    return {
      messageType: 'protocol',
      protocol: {
        type: protocol.type != null ? Number(protocol.type) : undefined,
        keyId: protocol.key?.id ?? undefined,
        targetMessageId: protocol.key?.id ?? undefined,
      },
      context,
    };
  }

  private static mapCall(
    msg: WAMessageContent,
    context?: MessageContext
  ): SentMessageContent | null {
    const call = msg.call ?? undefined;
    const type = msg.callLogMesssage ?? undefined;
    if (!call) {
      return null;
    }
    if (!type) return null;
    return {
      messageType: 'call',
      call: {
        callId: call.callKey?.toString() ?? undefined,
        type: 'callType' in type ? String(type.callType) : undefined,
        status: 'status' in type ? String(type.status) : undefined,
      },
      context,
    };
  }
}
