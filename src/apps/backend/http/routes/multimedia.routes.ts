import { Router } from 'express';
import multer from 'multer';
import { ContainerBuilder } from 'node-dependency-injection';

import { ControllerAdapter } from '@apps/backend/http/controllers/ControllerAdapter';
import { validate } from '@apps/backend/http/middlewares/ValidationMiddleware';
import {
  audioSchema,
  contactSchema,
  documentSchema,
  imageSchema,
  locationSchema,
  reactionSchema,
  stickerSchema,
  videoSchema,
} from '@apps/backend/http/validators/express/schemas/messageSchema';

import { parseUploadedFile } from '@shared/infrastructure/http/express/ParserUploadFile';

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
    parseUploadedFile('image'),
    validate(imageSchema),
    ControllerAdapter(imageController)
  );

  // Enviar documento
  router.post(
    '/:instanceId/send/document',
    upload.single('document'),
    parseUploadedFile('document'),
    validate(documentSchema),
    ControllerAdapter(documentController)
  );

  // Enviar audio
  router.post(
    '/:instanceId/send/audio',
    upload.single('audio'),
    parseUploadedFile('audio'),
    validate(audioSchema),
    ControllerAdapter(audioController)
  );

  // Enviar video
  router.post(
    '/:instanceId/send/video',
    upload.single('video'),
    parseUploadedFile('video'),
    validate(videoSchema),
    ControllerAdapter(videoController)
  );

  // Enviar ubicación
  router.post(
    '/:instanceId/send/location',
    validate(locationSchema),
    ControllerAdapter(locationController)
  );

  // Enviar reacción (emoji)
  router.post(
    '/:instanceId/send/reaction',
    validate(reactionSchema),
    ControllerAdapter(reactionController)
  );

  // Enviar contacto(s)
  router.post(
    '/:instanceId/send/contact',
    validate(contactSchema),
    ControllerAdapter(conctactController)
  );

  // Enviar sticker (imagen WebP)
  router.post(
    '/:instanceId/send/sticker',
    upload.single('sticker'),
    parseUploadedFile('sticker'),
    validate(stickerSchema),
    ControllerAdapter(stickerController)
  );

  return router;
};
