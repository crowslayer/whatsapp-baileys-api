import type { RequestFile } from '@shared/domain/RequestFile';

import type { NextFunction, Request, Response } from 'express';

export const parseUploadedFile = (targetField: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.files && Array.isArray(req.files)) {
      const localFiles: RequestFile[] = req.files.map((file) => ({
        source: 'local',
        buffer: file.buffer,
        mimetype: file.mimetype,
        filename: file.filename || file.originalname,
        originalname: file.originalname,
        path: file.path || '',
      }));

      req.body[targetField] = localFiles;
      return next();
    }

    if (req.file) {
      const localFile: RequestFile = {
        source: 'local',
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        filename: req.file.filename || req.file.originalname,
        originalname: req.file.originalname,
        path: req.file.path || '',
      };

      req.body[targetField] = localFile; // Inyecta un solo RequestFile
      return next();
    }

    if (req.body.url) {
      if (Array.isArray(req.body.url)) {
        req.body[targetField] = req.body.url.map((u: string) => ({
          source: 'remote',
          url: u,
        }));
      } else {
        req.body[targetField] = {
          source: 'remote',
          url: req.body.url,
        };
      }
      return next();
    }

    next();
  };
};
