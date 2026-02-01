import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from "../Middlewares/ValidationMiddleware";
import { IWhatsAppInstanceRepository } from '@domain/Repositories/IWhatsAppInstanceRepository';
import { BaileysConnectionManager } from '@infrastructure/Baileys/BaileysConnectionManager';
import { MultimediaController } from '../Controllers/MultimediaController';
import multer from 'multer';

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

export const createMultimediaRouter = (
  repository: IWhatsAppInstanceRepository,
  connectionManager: BaileysConnectionManager
): Router => {
  const router = Router();
  const controller = new MultimediaController(repository, connectionManager);

  // Enviar imagen
  router.post(
    '/:instanceId/send/image',
    upload.single('image'),
    validate([
      param('instanceId').isString().notEmpty(),
      body('to').isString().notEmpty().withMessage('Recipient is required'),
      body('caption').optional().isString(),
      body('fileName').optional().isString(),
    ]),
    (req, res) => controller.sendImage(req, res)
  );

  // Enviar documento
  router.post(
    '/:instanceId/send/document',
    upload.single('document'),
    validate([
      param('instanceId').isString().notEmpty(),
      body('to').isString().notEmpty().withMessage('Recipient is required'),
      body('caption').optional().isString(),
    ]),
    (req, res) => controller.sendDocument(req, res)
  );

  // Enviar audio
  router.post(
    '/:instanceId/send/audio',
    upload.single('audio'),
    validate([
      param('instanceId').isString().notEmpty(),
      body('to').isString().notEmpty().withMessage('Recipient is required'),
      body('ptt').optional().isString(), // 'true' o 'false'
    ]),
    (req, res) => controller.sendAudio(req, res)
  );

  // Enviar video
  router.post(
    '/:instanceId/send/video',
    upload.single('video'),
    validate([
      param('instanceId').isString().notEmpty(),
      body('to').isString().notEmpty().withMessage('Recipient is required'),
      body('caption').optional().isString(),
      body('gifPlayback').optional().isString(),
      body('fileName').optional().isString(),
    ]),
    (req, res) => controller.sendVideo(req, res)
  );

  // Enviar ubicación
  router.post(
    '/:instanceId/send/location',
    validate([
      param('instanceId').isString().notEmpty(),
      body('to').isString().notEmpty().withMessage('Recipient is required'),
      body('latitude').isFloat().withMessage('Valid latitude is required'),
      body('longitude').isFloat().withMessage('Valid longitude is required'),
      body('name').optional().isString(),
      body('address').optional().isString(),
    ]),
    (req, res) => controller.sendLocation(req, res)
  );

  // Enviar reacción (emoji)
  router.post(
    '/:instanceId/send/reaction',
    validate([
      param('instanceId').isString().notEmpty(),
      body('messageId').isString().notEmpty().withMessage('Message ID is required'),
      body('chatId').isString().notEmpty().withMessage('Chat ID is required'),
      body('emoji').isString().notEmpty().withMessage('Emoji is required'),
    ]),
    (req, res) => controller.sendReaction(req, res)
  );

  // Enviar contacto(s)
  router.post(
    '/:instanceId/send/contact',
    validate([
      param('instanceId').isString().notEmpty(),
      body('to').isString().notEmpty().withMessage('Recipient is required'),
      body('contacts').isArray().withMessage('Contacts array is required'),
      body('contacts.*.displayName').optional().isString(),
      body('contacts.*.vcard').isString().notEmpty().withMessage('vcard is required for each contact'),
    ]),
    (req, res) => controller.sendContact(req, res)
  );

  // Enviar sticker (imagen WebP)
  router.post(
    '/:instanceId/send/sticker',
    upload.single('sticker'),
    validate([
      param('instanceId').isString().notEmpty(),
      body('to').isString().notEmpty().withMessage('Recipient is required'),
    ]),
    (req, res) => controller.sendSticker(req, res)
  );

  return router;
};