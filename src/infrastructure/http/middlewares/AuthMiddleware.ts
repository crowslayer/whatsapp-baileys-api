import { NextFunction, Request, RequestHandler, Response } from 'express';

import { ITokenVerifier } from '@infrastructure/http/validators/token/Index';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

export class AuthMiddleware {
  static authenticate(
    tokenVerifier: ITokenVerifier,
    publicPaths: { method: string; path: string }[]
  ): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction): void => {
      const header = req.headers.authorization;

      const isPublic = publicPaths.some(
        (route) => route.method === req.method && route.path === req.path
      );

      if (isPublic) {
        next();
        return;
      }

      const match = typeof header === 'string' ? /^Bearer ([^\s]+)$/i.exec(header) : null;

      if (!match) {
        next(new UnauthorizedError('Missing or malformed Authorization header'));
        return;
      }

      const token = match[1];

      let decoded;

      try {
        decoded = tokenVerifier.verify(token);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          next(error);
          return;
        }
        next(new UnauthorizedError('Invalid or expired token'));
        return;
      }

      if (typeof decoded.sub !== 'string' || !decoded.sub.trim()) {
        next(new UnauthorizedError('Unauthorized user'));
        return;
      }

      req.user = {
        userId: decoded.sub,
        iss: decoded.iss,
        aud: decoded.aud,
      };
      next();
    };
  }
}
