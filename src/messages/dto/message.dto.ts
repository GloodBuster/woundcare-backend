import { Message } from '@prisma/client';

export type MessageDto = Message & {
  owner: boolean;
};
