import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface IRequestContext extends Request {
  requestId?: string;
  correlationId?: string;
}

export function requestIdMiddleware() {
  return (req: IRequestContext, res: Response, next: NextFunction) => {
    const requestId = sanitizeId(req.header('x-request-id')) ?? uuidv4();

    const correlationId = sanitizeId(req.header('x-correlation-id')) ?? requestId;

    req.requestId = requestId;
    req.correlationId = correlationId;

    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Correlation-Id', correlationId);

    next();
  };
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeId(value: string | undefined): string | null {
  if (!value) return null;
  return UUID_RE.test(value) ? value : null;
}
