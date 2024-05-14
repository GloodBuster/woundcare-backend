import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnexpectedError } from 'src/common/errors/service.error';
import { Patient } from '@prisma/client';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    nationalId: string,
    createMedicalRecordDto: CreateMedicalRecordDto,
  ): Promise<Patient | null> {
    try {
      const patient = await this.prismaService.patient.findUnique({
        where: { nationalId },
        select: { medicalRecords: true },
      });

      if (!patient) return patient;

      const { medicalRecords } = patient;

      return await this.prismaService.patient.update({
        where: { nationalId },
        data: {
          medicalRecords: {
            set: [...medicalRecords, createMedicalRecordDto.description],
          },
        },
      });
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async remove(
    nationalId: string,
    description: string,
  ): Promise<Patient | null> {
    try {
      const patient = await this.prismaService.patient.findUnique({
        where: { nationalId },
        select: { medicalRecords: true },
      });

      if (!patient) {
        return patient;
      }

      const { medicalRecords } = patient;

      return await this.prismaService.patient.update({
        where: { nationalId },
        data: {
          medicalRecords: {
            set: medicalRecords.filter(
              (medicalRecord) => medicalRecord !== description,
            ),
          },
        },
      });
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }
}
