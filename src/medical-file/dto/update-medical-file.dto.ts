import { PartialType } from '@nestjs/swagger';
import { CreateMedicalFileDto } from './create-medical-file.dto';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMedicalFileDto extends PartialType(CreateMedicalFileDto) {
  @IsString()
  @IsOptional()
  doctorId: string;

  @IsString()
  @IsOptional()
  nurseId: string;

  @IsDateString()
  @IsOptional()
  date: Date;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  @IsOptional()
  dischargeDate: Date;

  @IsArray()
  @IsOptional()
  physicalExam: string[];

  @IsArray()
  @IsOptional()
  medicalHistory: string[];

  @IsArray()
  @IsOptional()
  previousTreatment: string[];

  @IsArray()
  @IsOptional()
  labResults: string[];

  @IsArray()
  @IsOptional()
  carePlan: string[];
}
