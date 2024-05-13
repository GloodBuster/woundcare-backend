import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
