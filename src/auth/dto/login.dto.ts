import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export type LoginResponseDto = {
  token: string;
  role: Role;
};
