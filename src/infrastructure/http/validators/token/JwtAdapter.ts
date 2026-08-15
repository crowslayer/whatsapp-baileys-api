import fs from 'fs';
import path from 'path';

import jwt from 'jsonwebtoken';

import {
  IAuthenticatedUser,
  IJwtPayload,
  ITokenVerifier,
} from '@infrastructure/http/validators/token/Index';

import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

import { IJwtConfig } from '@config/index';

export class JwtAdapter implements ITokenVerifier {
  private readonly _privateKey: string;
  private readonly _publicKey: string;
  private readonly _config: IJwtConfig;

  constructor(config: IJwtConfig) {
    this._config = config;

    this._privateKey = fs.readFileSync(path.resolve(config.keys.privateKeyPath), 'utf8');

    this._publicKey = fs.readFileSync(path.resolve(config.keys.publicKeyPath), 'utf8');
  }

  generate(payload: IAuthenticatedUser): string {
    if (!payload) {
      throw new Error('Payload not be  null');
    }

    return jwt.sign(payload, this._privateKey, {
      algorithm: 'RS256',
      expiresIn: this._config.expires ?? '1h',
      issuer: this._config.issuer,
      audience: this._config.auddience,
    } as jwt.SignOptions);
  }

  verify(token: string): IJwtPayload {
    try {
      const payload = jwt.verify(token, this._publicKey, {
        algorithms: ['RS256'],
        issuer: this._config.issuer,
        audience: this._config.auddience,
      });

      if (typeof payload === 'string' || !payload.sub) {
        throw new UnauthorizedError('Invalid JWT payload');
      }

      return {
        sub: payload.sub,
        iss: payload.iss,
        aud: payload.aud,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired token', error);
    }
  }
}
