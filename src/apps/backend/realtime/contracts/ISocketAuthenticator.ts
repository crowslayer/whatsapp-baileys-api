import { ISocketUser } from '@apps/backend/realtime/contracts/ISocketUser';

export interface ISocketAuthenticator {
  authenticate(token: string): ISocketUser | Promise<ISocketUser>;
}
