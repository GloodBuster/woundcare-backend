import { Doctor } from '@prisma/client';
import { UserDto } from 'src/users/dto/users.dto';

export type DoctorDto = Doctor & {
  user: UserDto;
};
