import { Nurse } from '@prisma/client';
import { UserDto } from 'src/users/dto/users.dto';

export type NurseDto = Nurse & {
  user: UserDto;
};
