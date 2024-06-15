import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationDto } from './dto/notification.dto';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import {
  NotFoundError,
  UnexpectedError,
} from 'src/common/errors/service.error';
import { NotificationType, Prisma } from '@prisma/client';
import { UpdateReadNotificationDto } from './dto/update-read-notification.dto';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {name: 'dailyNotifications'})
  async sendDailyNotifications() {
    const users = await this.prismaService.patient.findMany({
      select: {
        nationalId: true,
      },
      where: {
        MedicalFile: {
          some: {
            dischargeDate: null
          }
        }
      }
    })


    users.forEach( user => {

      const notification: CreateNotificationDto = {
        message: "Hola, este es un recoradtorio para el vendaje de hoy",
        type: NotificationType.MONITORING_SIGNS_AND_SYMPTOMS,
        userId: user.nationalId
      }

      this.create( notification )

    })

    console.log('notificaciones enviadas')

    return;
  }

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationDto> {
    try {
      return await this.prismaService.notifications.create({
        data: createNotificationDto,
      });
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async findOne(id: number): Promise<NotificationDto | null> {
    try {
      return await this.prismaService.notifications.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async findUserNotifications(
    userId: string,
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<NotificationDto>> {
    try {
      const notifications = await this.prismaService.notifications.findMany({
        where: { userId },
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        orderBy: { date: 'desc' },
      });
      const totalItems = await this.prismaService.notifications.count({
        where: { userId },
      });
      return {
        items: notifications,
        meta: {
          totalItems,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          page,
          itemsPerPage,
        },
      };
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async updateManyReadStatus(
    nationalId: string,
    updateReadNotificationDto: UpdateReadNotificationDto,
  ): Promise<void> {
    try {
      await this.prismaService.notifications.updateMany({
        where: { userId: nationalId },
        data: { read: updateReadNotificationDto.read },
      });
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async updateReadStatus(
    nationalId: string,
    id: number,
    updateReadNotificationDto: UpdateReadNotificationDto,
  ): Promise<NotificationDto> {
    try {
      return await this.prismaService.notifications.update({
        where: { id, userId: nationalId },
        data: { read: updateReadNotificationDto.read },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(
            `There is no notification with the id (${id}) for the user (${nationalId})`,
            { cause: error },
          );
        }
      }
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationDto> {
    try {
      return await this.prismaService.notifications.update({
        where: { id },
        data: updateNotificationDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(
            `There is no notification with the id (${id})`,
            { cause: error },
          );
        }
      }
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async remove(id: number): Promise<NotificationDto> {
    try {
      return await this.prismaService.notifications.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(
            `There is no notification with the id (${id})`,
            { cause: error },
          );
        }
      }
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }
}
