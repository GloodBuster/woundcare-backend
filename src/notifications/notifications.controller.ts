import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  Query,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Request,
  DefaultValuePipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationDto } from './dto/notification.dto';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { NotFoundError } from 'src/common/errors/service.error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestWithUser } from 'src/common/interfaces/request.interface';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationDto> {
    try {
      return await this.notificationsService.create(createNotificationDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('me')
  @Roles(Role.DOCTOR, Role.PATIENT, Role.NURSE, Role.ADMIN)
  async findUserNotifications(
    @Request() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<NotificationDto>> {
    try {
      return await this.notificationsService.findUserNotifications(
        req.user.nationalId,
        page,
        itemsPerPage,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.findOne(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  @Patch()
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    try {
      return await this.notificationsService.update(id, updateNotificationDto);
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new NotFoundException(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.notificationsService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new NotFoundException(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
