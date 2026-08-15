export interface IAuthenticatedUser {
  userId: string;
  aud?: string | string[];
  iss?: string;
}

export interface IJwtPayload {
  [key: string]: unknown;
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export interface ITokenVerifier {
  generate(payload: IAuthenticatedUser): string;
  verify(token: string): IJwtPayload;
}
