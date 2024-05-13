import { NotificationType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsBoolean()
  @IsOptional()
  read?: boolean;
}
