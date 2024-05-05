import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import { BloodType } from '@prisma/client';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsString()
  adress?: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  cellPhoneNumber?: string;

  @IsString()
  photo?: string;

  @IsString()
  bloodType?: BloodType;

  @IsNumber()
  weight?: number;

  @IsNumber()
  height?: number;

  @IsArray()
  allergies?: string[];

  @IsArray()
  medicalRecord?: string[];
}
