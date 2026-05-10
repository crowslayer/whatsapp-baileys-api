import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { ContainerBuilder } from 'node-dependency-injection';

import { validate } from '@infrastructure/http/middlewares/ValidationMiddleware';
import {
  audioSchema,
  contactSchema,
  documentSchema,
  imageSchema,
  locationSchema,
  reactionSchema,
  stickerSchema,
  videoSchema,
} from '@infrastructure/http/validators/express/schemas/messageSchema';

// Configuración de multer para manejo de archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedMimes = [
      // Imágenes
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Documentos
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      // Audio
      'audio/mpeg',
      'audio/mp4',
      'audio/ogg',
      'audio/wav',
      'audio/aac',
      // Video
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

export const createMultimediaRouter = (container: ContainerBuilder): Router => {
  const router = Router();
  const imageController = container.get('http.controller.messages.send_image');
  const documentController = container.get('http.controller.messages.send_document');
  const audioController = container.get('http.controller.messages.send_audio');
  const videoController = container.get('http.controller.messages.send_video_message');
  const locationController = container.get('http.controller.messages.send_location');
  const reactionController = container.get('http.controller.messages.send_reaction');
  const conctactController = container.get('http.controller.messages.send_contact');
  const stickerController = container.get('http.controller.messages.send_sticker');

  // Enviar imagen
  router.post(
    '/:instanceId/send/image',
    upload.single('image'),
    validate(imageSchema),
    (req: Request, res: Response, next: NextFunction) => imageController.handle(req, res, next)
  );

  // Enviar documento
  router.post(
    '/:instanceId/send/document',
    upload.single('document'),
    validate(documentSchema),
    (req: Request, res: Response, next: NextFunction) => documentController.handle(req, res, next)
  );

  // Enviar audio
  router.post(
    '/:instanceId/send/audio',
    upload.single('audio'),
    validate(audioSchema),
    (req: Request, res: Response, next: NextFunction) => audioController.handle(req, res, next)
  );

  // Enviar video
  router.post(
    '/:instanceId/send/video',
    upload.single('video'),
    validate(videoSchema),
    (req: Request, res: Response, next: NextFunction) => videoController.handle(req, res, next)
  );

  // Enviar ubicación
  router.post(
    '/:instanceId/send/location',
    validate(locationSchema),
    (req: Request, res: Response, next: NextFunction) => locationController.handle(req, res, next)
  );

  // Enviar reacción (emoji)
  router.post(
    '/:instanceId/send/reaction',
    validate(reactionSchema),
    (req: Request, res: Response, next: NextFunction) => reactionController.handle(req, res, next)
  );

  // Enviar contacto(s)
  router.post(
    '/:instanceId/send/contact',
    validate(contactSchema),
    (req: Request, res: Response, next: NextFunction) => conctactController.handle(req, res, next)
  );

  // Enviar sticker (imagen WebP)
  router.post(
    '/:instanceId/send/sticker',
    upload.single('sticker'),
    validate(stickerSchema),
    (req: Request, res: Response, next: NextFunction) => stickerController.handle(req, res, next)
  );

  return router;
};
