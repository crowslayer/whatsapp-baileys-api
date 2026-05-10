import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { ILogger } from '@infrastructure/loggers/Logger';

interface IRequestContext extends Request {
  requestId?: string;
  correlationId?: string;
}

export function loggerMiddleware(logger: ILogger) {
  return (req: IRequestContext, res: Response, next: NextFunction): void => {
    const requestId = req.requestId ?? uuidv4();
    const correlationId = req.correlationId ?? requestId;

    res.locals.requestId = requestId;
    res.locals.correlationId = correlationId;

    logger.info({
      requestId,
      correlationId,
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
        correlationId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  };
}
