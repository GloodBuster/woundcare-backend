import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMedicalFileDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @IsNotEmpty()
  nurseId: string;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsOptional()
  dischargeDate: Date;

  @IsArray()
  @IsNotEmpty()
  physicalExam: string[];

  @IsArray()
  @IsNotEmpty()
  medicalHistory: string[];

  @IsArray()
  @IsNotEmpty()
  previousTreatment: string[];

  @IsArray()
  @IsNotEmpty()
  labResults: string[];

  @IsArray()
  @IsNotEmpty()
  carePlan: string[];
}
