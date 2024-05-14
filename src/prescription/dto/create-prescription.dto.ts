import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePrescriptionDto {
  @IsNumber()
  @IsNotEmpty()
  medicalFileId: number;

  @IsNumber()
  @IsNotEmpty()
  medicineId: number;

  @IsNumber()
  @IsNotEmpty()
  dose: number;

  @IsNumber()
  @IsNotEmpty()
  lapse: number;
}
