import fs from 'node:fs';
import path from 'node:path';

import jwt, { SignOptions } from 'jsonwebtoken';

import { IJwtConfig } from '@apps/backend/config';
import {
  IAuthenticatedUser,
  IJwtPayload,
  ITokenVerifier,
} from '@apps/backend/http/validators/token/Index';

import { ConfigurationError } from '@shared/infrastructure/errors/ConfigurationError';
import { UnauthorizedError } from '@shared/infrastructure/errors/UnauthorizedError';

export class JwtAdapter implements ITokenVerifier {
  private readonly _privateKey: string;
  private readonly _publicKey: string;
  private readonly _config: IJwtConfig;

  constructor(config: IJwtConfig) {
    this._config = config;

    this._privateKey = fs.readFileSync(path.resolve(config.keys.privateKeyPath), 'utf8');

    this._publicKey = fs.readFileSync(path.resolve(config.keys.publicKeyPath), 'utf8');

    if (!this._privateKey.includes('PRIVATE KEY')) {
      throw new ConfigurationError('La clave privada JWT no parece válida');
    }

    if (!this._publicKey.includes('PUBLIC KEY')) {
      throw new ConfigurationError('La clave pública JWT no parece válida');
    }
  }

  generate(payload: IAuthenticatedUser): string {
    if (!payload || typeof payload !== 'object') {
      throw new UnauthorizedError('Payload not be  null');
    }

    const options: SignOptions = {
      algorithm: 'RS256',
      expiresIn: (this._config.expires ?? '15m') as SignOptions['expiresIn'],
      issuer: this._config.issuer,
      audience: this._config.audience,
    };

    return jwt.sign(payload, this._privateKey, options);
  }

  verify(token: string): IJwtPayload {
    try {
      if (typeof token !== 'string' || token.length == 0) {
        throw new UnauthorizedError('Invalid JWT');
      }

      const payload = jwt.verify(token, this._publicKey, {
        algorithms: ['RS256'],
        issuer: this._config.issuer,
        audience: this._config.audience,
        maxAge: this._config.expires ?? '15m',
        clockTolerance: 5,
      });

      if (
        typeof payload === 'string' ||
        typeof payload.sub !== 'string' ||
        payload.sub.trim() === '' ||
        typeof payload.exp !== 'number' ||
        typeof payload.iat !== 'number'
      ) {
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
      throw new UnauthorizedError('Invalid or expired token', { cause: error });
    }
  }
}
