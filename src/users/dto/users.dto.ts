import { User as PrismaUser } from '@prisma/client';

export type UserDto = Omit<PrismaUser, 'password'>;
