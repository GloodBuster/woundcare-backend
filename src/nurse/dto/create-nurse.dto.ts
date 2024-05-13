import { Genre } from '@prisma/client';
import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateNurseDto {
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsString()
  genre: Genre;

  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;

  @IsNotEmpty()
  @IsString()
  medicalCenter: string;
}
