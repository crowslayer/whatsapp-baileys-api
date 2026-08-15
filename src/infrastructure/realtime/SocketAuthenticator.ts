import { ITokenVerifier } from '@infrastructure/http/validators/token/Index';
import { ISocketUser } from '@infrastructure/realtime/SocketGateway';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

export interface ISocketAuthenticator {
  authenticate(token: string): ISocketUser;
}

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
