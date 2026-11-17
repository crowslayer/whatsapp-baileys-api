import { ITokenVerifier } from '@apps/backend/http/validators/token/Index';
import { ISocketAuthenticator } from '@apps/backend/realtime/contracts/ISocketAuthenticator';
import { ISocketUser } from '@apps/backend/realtime/contracts/ISocketUser';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

export class SocketAuthenticator implements ISocketAuthenticator {
  constructor(private readonly tokenVerifier: ITokenVerifier) {}

  authenticate(token: string): ISocketUser {
    if (typeof token !== 'string' || token.length === 0 || token.length > 4096) {
      throw new UnauthorizedError('Invalid authentication token');
    }

    const authenticatedUser = this.tokenVerifier.verify(token);

    if (!authenticatedUser.sub) {
      throw new UnauthorizedError('Invalid authenticated user');
    }

    return {
      userId: authenticatedUser.sub,
    };
  }
}
