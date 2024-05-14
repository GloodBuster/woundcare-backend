import { PartialType } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';
import { BloodType } from '@prisma/client';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsString()
  @IsOptional()
  adress: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  cellPhoneNumber: string;

  @IsString()
  @IsOptional()
  photo: string;

  @IsString()
  @IsOptional()
  bloodType: BloodType;

  @IsNumber()
  @IsOptional()
  weight: number;

  @IsNumber()
  @IsOptional()
  height: number;

  @IsArray()
  @IsOptional()
  allergies: string[];

  @IsArray()
  @IsOptional()
  medicalRecord: string[];
}
