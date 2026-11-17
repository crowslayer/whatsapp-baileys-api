import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';

import { MessageError } from '@modules/messages/application/MessageError';
import { SendReactionCommand } from '@modules/messages/application/reaction/SendReactionCommand';

type ReactionParams = {
  params: {
    instanceId: string;
  };
  body: {
    reaction: {
      messageId: string;
      emoji: string | null;
      chatId: string;
      fromMe?: boolean;
    };
  };
};

type ReactionRequest = IHttpRequest & ReactionParams;

export class SendReactionController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: ReactionRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { messageId, emoji, chatId, fromMe = false } = req.body.reaction;

    if (!emoji) {
      throw new MessageError('emoji is required');
    }

    const command = new SendReactionCommand(
      instanceId,
      {
        messageId,
        chatId,
        fromMe,
      },
      emoji
    );

    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok(content);
  }
}
