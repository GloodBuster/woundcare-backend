import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    conversationId: number

    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsOptional()
    text?: string

    @IsString()
    @IsOptional()
    image?: string

}
