import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '@shared/infrastructure/ResponseHandler';
// import pino from 'pino';
import { Logger } from '@infrastructure/Logger/Logger';

// const logger = pino();

export function errorMiddleware(logger:Logger)  {
return (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  logger.error({
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  return ResponseHandler.internalError(res, error.message);
};
}
  