import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateBandageChangeDto {
  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  nurseId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;
}
