import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { Logger } from '@infrastructure/Logger/Logger';

export function loggerMiddleware(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = uuidv4();
    res.locals.requestId = requestId;

    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        requestId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  };
}
