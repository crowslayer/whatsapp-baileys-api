import { IConfig } from '@apps/backend/config';
import { ITokenVerifier } from '@apps/backend/http/validators/token/Index';
import { JwtAdapter } from '@apps/backend/http/validators/token/JwtAdapter';

import { ConfigurationError } from '@shared/infrastructure/errors/ConfigurationError';

export class TokenVerifierFactory {
  static createTokenVerifier(config: IConfig): ITokenVerifier {
    switch (config.security?.type) {
      case 'jwt':
        return new JwtAdapter(config.security.jwt);
      default:
        throw new ConfigurationError(`Unsupported security type: ${config.security?.type}`);
    }
  }
}
