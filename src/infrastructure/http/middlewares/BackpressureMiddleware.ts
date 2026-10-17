import { BoundedQueue } from '@infrastructure/concurrency/BoundedQueue';
import { QueueFullError } from '@infrastructure/concurrency/QueueFullError';

import { ServiceOverloadedError } from '@shared/infrastructure/errors/ServiceOverloadError';

import type { NextFunction, Request, RequestHandler, Response } from 'express';

const MAX_RETRY_AFTER_SECONDS = 30;

const calculateRetryAfter = (queueSize: number, maxQueueSize: number): number => {
  const saturation = queueSize / maxQueueSize;

  const min = 1;

  const max = Math.min(MAX_RETRY_AFTER_SECONDS, Math.max(2, Math.ceil(2 + saturation * 10)));

  return Math.floor(Math.random() * (max - min + 1)) + min;
};
export class BackpressureMiddleware {
  static concurrencyLimiter(): RequestHandler {
    const requestQueue = new BoundedQueue({ maxSize: 500, concurrency: 30 });

    return (_req: Request, res: Response, next: NextFunction): void => {
      void requestQueue
        .add(
          () =>
            new Promise<void>((resolve) => {
              let completed = false;
              const finish = (): void => {
                if (completed) return;

                completed = true;
                resolve();
              };
              res.once('finish', finish);
              res.once('close', finish);

              next();
            })
        )
        .catch((error: unknown) => {
          if (error instanceof QueueFullError) {
            const retryAfter = calculateRetryAfter(requestQueue.size, requestQueue.maxQueueSize);
            next(new ServiceOverloadedError(retryAfter, error));
            return;
          }
          next(error);
        });
    };
  }
}
