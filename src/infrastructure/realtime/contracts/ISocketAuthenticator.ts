import { ISocketUser } from '@infrastructure/realtime/contracts/ISocketUser';

export interface ISocketAuthenticator {
  authenticate(token: string): ISocketUser | Promise<ISocketUser>;
}
