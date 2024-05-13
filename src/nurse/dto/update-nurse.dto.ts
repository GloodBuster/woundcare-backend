import { PartialType } from '@nestjs/swagger';
import { CreateNurseDto } from './create-nurse.dto';
import { IsDateString, IsString } from 'class-validator';
import { Genre } from '@prisma/client';

export class UpdateNurseDto extends PartialType(CreateNurseDto) {
  @IsString()
  genre?: Genre;

  @IsDateString()
  birthDate?: Date;

  @IsString()
  medicalCenter?: string;
}
