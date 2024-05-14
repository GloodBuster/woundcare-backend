import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReadNotificationDto {
  @IsBoolean()
  @IsOptional()
  read: boolean;
}
