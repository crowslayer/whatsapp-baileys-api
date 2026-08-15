import { NextFunction, Request, RequestHandler, Response } from 'express';

import { ITokenVerifier } from '@infrastructure/http/validators/token/Index';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

export function createAuthMiddleware(tokenVerifier: ITokenVerifier): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      next(new UnauthorizedError('Missing or malformed Authorization header'));
      return;
    }

    const token = header.slice(7);

    try {
      const decoded = tokenVerifier.verify(token);

      const user = decoded.sub;
      if (!user) {
        throw new UnauthorizedError('Unauthorized user');
      }
      req.user = { userId: user, iss: decoded.iss, aud: decoded.aud };
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        next(error);
      } else {
        next(new UnauthorizedError('Invalid or expired token'));
      }
    }
  };
}
