import { Injectable } from '@nestjs/common';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  NotFoundError,
  UnexpectedError,
} from 'src/common/errors/service.error';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { addHour } from '@formkit/tempo';

@Injectable()
export class PrescriptionService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createPrescriptionDto: CreatePrescriptionDto) {
    try {
      return await this.prismaService.prescription.create({
        data: {
          medicalFileId: createPrescriptionDto.medicalFileId,
          medicineName: createPrescriptionDto.medicineName,
          medicineDescription: createPrescriptionDto.medicineDescription,
          dose: createPrescriptionDto.dose,
          lapse: createPrescriptionDto.lapse,
          nextMedicine: addHour(new Date(), createPrescriptionDto.lapse)
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

  async findAll() {
    return await this.prismaService.prescription.findMany();
  }

  async findOne(id: number) {
    return await this.prismaService.prescription.findUnique({
      where: {
        id: id,
      },
    });
  }

  async findPrescriptionForPatient(patientId: string) {
    try {
      const medicalFile = await this.prismaService.medicalFile.findFirst({
        where: {
          patientId: patientId,
        },
      });

      if (!medicalFile) return null;

      const prescriptions = await this.prismaService.prescription.findMany({
        where: {
          medicalFileId: medicalFile.id,
        },
        select:{
          medicineName: true,
          medicineDescription: true,
          dose: true,
          lapse: true,
        }
      });

      return prescriptions;
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto) {
    try {
      return await this.prismaService.prescription.update({
        where: {
          id: id,
        },
        data: {
          ...updatePrescriptionDto,
        }
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('there is no prescription with this id');
        }
      }
      throw new UnexpectedError(error.message, {
        cause: error,
      });
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.prescription.delete({
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
      throw new UnexpectedError(error.message, {
        cause: error,
      });
    }
  }
}
