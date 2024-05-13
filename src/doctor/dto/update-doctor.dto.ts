import { PartialType } from '@nestjs/swagger';
import { CreateDoctorDto } from './create-doctor.dto';
import { IsDateString, IsString } from 'class-validator';
import { Genre } from '@prisma/client';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @IsString()
  genre?: Genre;

  @IsDateString()
  birthDate?: Date;

  @IsString()
  medicalCenter?: string;
}
