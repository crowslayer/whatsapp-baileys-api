export interface IAuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
}

export interface ITokenVerifier {
  generate(payload: IAuthenticatedUser, expiresIn?: string): string;
  verify(token: string): IAuthenticatedUser;
}
