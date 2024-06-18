import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePrescriptionDto {
    @IsString()
    @IsOptional()
    medicineName?: string

    @IsString()
    @IsOptional()
    medicineDescription?: string

    @IsNumber()
    @IsOptional()
    lapse?: number

    @IsNumber()
    @IsOptional()
    dose?: number

    @IsDateString()
    @IsOptional()
    nextMedicine?: string
}