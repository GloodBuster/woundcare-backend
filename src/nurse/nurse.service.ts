import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNurseDto } from './dto/create-nurse.dto';
import { UpdateNurseDto } from './dto/update-nurse.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  AlreadyExistsError,
  NotFoundError,
  UnexpectedError,
} from 'src/common/errors/service.error';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { NurseDto } from './dto/nurse.dto';

@Injectable()
export class NurseService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createNurseDto: CreateNurseDto) {
    try {
      const hashedPassword = await bcrypt.hash(
        createNurseDto.password,
        Number(process.env.SALT_ROUNDS) || 10,
      );

      const [user, nurse] = await this.prismaService.$transaction([
        this.prismaService.user.create({
          data: {
            nationalId: createNurseDto.nationalId,
            fullname: createNurseDto.fullname,
            email: createNurseDto.email,
            password: hashedPassword,
            role: Role.NURSE,
          },
        }),
        this.prismaService.nurse.create({
          data: {
            nationalId: createNurseDto.nationalId,
            genre: createNurseDto.genre,
            birthDate: new Date(createNurseDto.birthDate).toISOString(),
            medicalCenter: createNurseDto.medicalCenter,
          },
        }),
      ]);

      return nurse;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AlreadyExistsError(
            `A nurse with the id ${createNurseDto.nationalId} already exists`,
            { cause: error },
          );
        }
      }
      throw new UnexpectedError('an unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async findNursesPage(
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<NurseDto>> {
    try {
      const [totalItems, nurses] = await this.prismaService.$transaction([
        this.prismaService.nurse.count(),
        this.prismaService.nurse.findMany({
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
        items: nurses,
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
    return await this.prismaService.nurse.findUnique({
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

  async update(id: string, updateNurseDto: UpdateNurseDto) {
    try {
      const nurse = await this.prismaService.nurse.update({
        where: {
          nationalId: id,
        },
        data: {
          genre: updateNurseDto.genre,
          birthDate: updateNurseDto.birthDate,
          medicalCenter: updateNurseDto.medicalCenter,
        },
      });

      return nurse;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`A nurse with the id ${id} doesn't exists`, {
            cause: error,
          });
        }
      }
      throw new UnexpectedError('an unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async remove(id: string) {
    try {
      const [userNurse, nurse] = await this.prismaService.$transaction([
        this.prismaService.nurse.delete({
          where: {
            nationalId: id,
          },
        }),
        this.prismaService.user.delete({
          where: {
            nationalId: id,
          },
        }),
      ]);

      return nurse;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`A nurse with the id ${id} doesn't exists`, {
            cause: error,
          });
        }
      }
      throw new UnexpectedError('an unexpected situation ocurred', {
        cause: error,
      });
    }
  }
}
