import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UnexpectedError } from 'src/common/errors/service.error';
import { Patient } from '@prisma/client';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    nationaId: string,
    createMedicalRecordDto: CreateMedicalRecordDto,
  ): Promise<Patient | null> {
    try {
      const patient = await this.prismaService.patient.findUnique({
        where: { nationalId: nationaId },
        select: { medicalRecords: true },
      });

      if (!patient) return patient;

      patient.medicalRecords.push(createMedicalRecordDto.description);

      return await this.prismaService.patient.update({
        where: { nationalId: nationaId },
        data: {
          medicalRecords: patient.medicalRecords,
        },
      });
    } catch (error) {
      throw new UnexpectedError('An unexpected situation ocurred', {
        cause: error,
      });
    }
  }

  async remove(
    nationaId: string,
    description: string,
  ): Promise<Patient | null> {
    try {
      const patient = await this.prismaService.patient.findUnique({
        where: { nationalId: nationaId },
        select: { medicalRecords: true },
      });

      if (!patient) {
        return patient;
      }

      const { medicalRecords } = patient;

      return await this.prismaService.patient.update({
        where: { nationalId: nationaId },
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
