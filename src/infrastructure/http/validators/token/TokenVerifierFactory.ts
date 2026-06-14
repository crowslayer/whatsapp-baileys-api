import { ITokenVerifier } from '@infrastructure/http/validators/token/Index';
import { JwtAdapter } from '@infrastructure/http/validators/token/JwtAdapter';

import { IConfig } from '@config/index';

export function createTokenVerifier(config: IConfig): ITokenVerifier {
  switch (config.security?.type) {
    case 'jwt':
      return new JwtAdapter(config.security.jwt.secret);
    default:
      throw new Error(`Unsupported security type: ${config.security?.type}`);
  }
}
