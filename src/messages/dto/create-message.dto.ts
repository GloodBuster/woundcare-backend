import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
    @IsInt()
    @IsOptional()
    conversationId: number

    @IsString()
    @IsNotEmpty()
    userId: string

    @IsString()
    @IsOptional()
    text: string

    @IsString()
    @IsOptional()
    image: string
}
