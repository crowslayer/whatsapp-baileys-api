import jwt from 'jsonwebtoken';

import { IAuthenticatedUser, ITokenVerifier } from '@infrastructure/http/validators/token/Index';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

export class JwtAdapter implements ITokenVerifier {
  constructor(private readonly secret: string) {}

  generate(payload: IAuthenticatedUser, expiresIn?: string): string {
    if (!payload.userId || !payload.email) {
      throw new Error('Payload must include userId and email');
    }

    return jwt.sign(
      { userId: payload.userId, email: payload.email, roles: payload.roles ?? [] },
      this.secret,
      { expiresIn: expiresIn ?? '1h' } as jwt.SignOptions
    );
  }

  verify(token: string): IAuthenticatedUser {
    try {
      const decoded = jwt.verify(token, this.secret) as IAuthenticatedUser;

      if (!decoded.userId || !decoded.email) {
        throw new UnauthorizedError('Token payload is missing required fields');
      }

      return decoded;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired token', error);
    }
  }
}
