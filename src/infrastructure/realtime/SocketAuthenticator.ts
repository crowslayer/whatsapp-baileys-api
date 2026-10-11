import { ITokenVerifier } from '@infrastructure/http/validators/token/Index';
import { ISocketAuthenticator } from '@infrastructure/realtime/contracts/ISocketAuthenticator';
import { ISocketUser } from '@infrastructure/realtime/contracts/ISocketUser';

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
