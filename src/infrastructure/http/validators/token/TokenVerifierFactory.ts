import { ITokenVerifier } from '@infrastructure/http/validators/token/Index';
import { JwtAdapter } from '@infrastructure/http/validators/token/JwtAdapter';

import { InfrastructureError } from '@shared/infrastructure/errors/InfrastructureError';

import { IConfig } from '@config/index';

export class TokenVerifierFactory {
  static createTokenVerifier(config: IConfig): ITokenVerifier {
    switch (config.security?.type) {
      case 'jwt':
        return new JwtAdapter(config.security.jwt);
      default:
        throw new InfrastructureError(`Unsupported security type: ${config.security?.type}`);
    }
  }
}
