import { Injectable } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  NotFoundError,
  UnexpectedError,
} from 'src/common/errors/service.error';

@Injectable()
export class PrescriptionService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPrescriptionDto: CreatePrescriptionDto) {
    try {
      return this.prismaService.prescription.create({
        data: {
          medicalFileId: createPrescriptionDto.medicalFileId,
          medicineId: createPrescriptionDto.medicineId,
          dose: createPrescriptionDto.dose,
          lapse: createPrescriptionDto.lapse,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(
            'there is no medical file or medicine with that id',
          );
        }
      }
      throw new UnexpectedError('an unexpected error ocurred', {
        cause: error,
      });
    }
  }

  findAll() {
    return this.prismaService.prescription.findMany();
  }

  findOne(id: number) {
    return this.prismaService.prescription.findUnique({
      where: {
        id: id,
      },
    });
  }

  remove(id: number) {
    try {
      return this.prismaService.prescription.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('there is no prescription with this id');
        }
      }
      throw new UnexpectedError('an unexpected error ocurred', {
        cause: error,
      });
    }
  }
}
