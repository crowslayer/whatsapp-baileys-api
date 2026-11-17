import { IController, IHttpRequest } from '@apps/backend/http/controllers/IController';

import { ICommandBus } from '@shared/domain/command/CommandBus';
import { RequestFile } from '@shared/domain/RequestFile';
import { ISentMessage } from '@shared/domain/whatsapp/MessageTypes';
import { HttpResponse } from '@shared/infrastructure/http/response/HttpResponse';
import { ResponseBuilder } from '@shared/infrastructure/http/response/ResponseBuilder';
import { PhoneNormalizer } from '@shared/infrastructure/utils/PhoneNormalizer';

import { MessageError } from '@modules/messages/application/MessageError';
import { SendVideoCommand } from '@modules/messages/application/video/SendVideoCommand';

type VideoRequestParams = {
  params: {
    instanceId: string;
  };
  body: {
    to: string;
    caption?: string;
    video: RequestFile;
    gifPlayback?: boolean;
    jpegThumbnail?: string;
    ptv?: boolean;
  };
};

type VideoRequest = IHttpRequest & VideoRequestParams;

export class SendVideoController implements IController {
  constructor(private readonly commandBus: ICommandBus) {}

  async handle(req: VideoRequest): Promise<HttpResponse<ISentMessage>> {
    const { instanceId } = req.params;
    const { to, caption, gifPlayback = false, video, ptv = false, jpegThumbnail } = req.body;

    if (!video) {
      throw new MessageError('Video file is required');
    }

    const normalizer = new PhoneNormalizer();
    const jid = normalizer.toJid(to);
    if (!jid) {
      throw new MessageError('Phone invalid');
    }

    const command = new SendVideoCommand(
      instanceId,
      jid,
      video,
      caption,
      gifPlayback,
      ptv,
      jpegThumbnail
    );
    const content = await this.commandBus.dispatch<ISentMessage>(command);

    return ResponseBuilder.ok(content);
  }
}
