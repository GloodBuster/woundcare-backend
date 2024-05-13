import { Request } from 'express';

interface User {
  nationalId: string;
}

export interface RequestWithUser extends Request {
  user: User;
}
