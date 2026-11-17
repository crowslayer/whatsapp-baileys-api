import { IAuthenticatedUser } from '@apps/backend/http/validators/token/Index';
import 'multer';

declare global {
  namespace Express {
    // eslint-disable-next-line
    interface Request {
      user?: IAuthenticatedUser;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
