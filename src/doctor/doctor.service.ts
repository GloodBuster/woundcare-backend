import { Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  AlreadyExistsError,
  NotFoundError,
  UnexpectedError,
} from 'src/common/errors/service.error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { DoctorDto } from './dto/doctor.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createDoctorDto: CreateDoctorDto) {
    try {
      const hashedPassword = await bcrypt.hash(
        createDoctorDto.password,
        Number(process.env.SALT_ROUNDS) || 10,
      );

      const [doctorUser, doctor] = await this.prismaService.$transaction([
        this.prismaService.user.create({
          data: {
            nationalId: createDoctorDto.nationalId,
            fullname: createDoctorDto.fullname,
            email: createDoctorDto.email,
            password: hashedPassword,
            role: Role.DOCTOR,
          },
        }),
        this.prismaService.doctor.create({
          data: {
            nationalId: createDoctorDto.nationalId,
            genre: createDoctorDto.genre,
            birthDate: new Date(createDoctorDto.birthDate).toISOString(),
            medicalCenter: createDoctorDto.medicalCenter,
          },
        }),
      ]);

      return doctor;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AlreadyExistsError(
            `a doctor with the id ${createDoctorDto.nationalId} already exists`,
            { cause: error },
          );
        }
      }
      throw new UnexpectedError(error.message, { cause: error });
    }
  }

  async findDoctorsPage(
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<DoctorDto>> {
    try {
      const [totalItems, doctors] = await this.prismaService.$transaction([
        this.prismaService.doctor.count(),
        this.prismaService.doctor.findMany({
          include: {
            user: {
              select: {
                nationalId: true,
                fullname: true,
                email: true,
                role: true,
              },
            },
          },
          take: itemsPerPage,
          skip: (page - 1) * itemsPerPage,
        }),
      ]);
      return {
        items: doctors,
        meta: {
          itemsPerPage,
          page,
          totalItems,
          totalPages: Math.ceil(totalItems / itemsPerPage),
        },
      };
    } catch (error) {
      throw new UnexpectedError('An unexpected error ocurred', {
        cause: error,
      });
    }
  }

  async findOne(id: string) {
    return await this.prismaService.doctor.findUnique({
      where: {
        nationalId: id,
      },
      include: {
        user: {
          select: {
            nationalId: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    try {
      const doctor = await this.prismaService.doctor.update({
        where: {
          nationalId: id,
        },
        data: {
          genre: updateDoctorDto.genre,
          birthDate: updateDoctorDto.birthDate,
          medicalCenter: updateDoctorDto.medicalCenter,
        },
      });
      return doctor;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`there is no doctor with the id ${id}`, {
            cause: error,
          });
        }
      }
      throw new UnexpectedError('an unexpected situation has ocurred', {
        cause: error,
      });
    }
  }

  async remove(id: string) {
    try {
      const [userDoctor, deletedDoctor] = await this.prismaService.$transaction(
        [
          this.prismaService.doctor.delete({
            where: {
              nationalId: id,
            },
          }),
          this.prismaService.user.delete({
            where: {
              nationalId: id,
            },
          }),
        ],
      );

      return deletedDoctor;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`there is no doctor with the id ${id}`, {
            cause: error,
          });
        }
      }
      throw new UnexpectedError('an unexpected situation has ocurred', {
        cause: error,
      });
    }
  }
}
