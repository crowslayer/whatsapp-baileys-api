import { IAuthenticatedUser } from '@infrastructure/http/validators/token/Index';

declare global {
  namespace Express {
    interface Request {
      user?: IAuthenticatedUser;
    }
  }
}
