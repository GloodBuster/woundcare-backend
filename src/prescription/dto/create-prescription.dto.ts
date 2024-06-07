import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsNumber()
  @IsNotEmpty()
  medicalFileId: number;

  @IsString()
  @IsNotEmpty()
  medicineName: string;

  @IsString()
  @IsNotEmpty()
  medicineDescription: string

  @IsNumber()
  @IsNotEmpty()
  dose: number;

  @IsNumber()
  @IsNotEmpty()
  lapse: number;
}
