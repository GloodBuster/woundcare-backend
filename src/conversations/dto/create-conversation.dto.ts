import { IsInt, IsNotEmpty, IsString } from "class-validator"

export class CreateConversationDto {

    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsNotEmpty()
    nurseId: string

    @IsInt()
    @IsNotEmpty()
    medicalFileId: number
}
