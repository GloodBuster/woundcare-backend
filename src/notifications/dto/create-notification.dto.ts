import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  @ApiProperty({
    example: `${NotificationType.BANDAGE_CHANGE} | ${NotificationType.DISCHARGE} | ${NotificationType.MEDICATION_TIME} | ${NotificationType.MONITORING_SIGNS_AND_SYMPTOMS}`,
  })
  type: NotificationType;
}
