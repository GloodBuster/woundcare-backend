import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMedicalFileDto } from './dto/create-medical-file.dto';
import { UpdateMedicalFileDto } from './dto/update-medical-file.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicalFileService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createMedicalFileDto: CreateMedicalFileDto) {
    const patient = await this.prismaService.patient.findUnique({
      select: {
        nationalId: true,
      },
      where: {
        nationalId: createMedicalFileDto.patientId,
      },
    });

    if (!patient) {
      throw new HttpException(
        "this patient doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }

    const nurse = await this.prismaService.nurse.findUnique({
      select: {
        nationalId: true,
      },
      where: {
        nationalId: createMedicalFileDto.nurseId,
      },
    });

    if (!nurse) {
      throw new HttpException(
        "this nurse doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }
    const doctor = await this.prismaService.doctor.findUnique({
      select: {
        nationalId: true,
      },
      where: {
        nationalId: createMedicalFileDto.doctorId,
      },
    });

    if (!doctor) {
      throw new HttpException(
        "this doctor doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }

    const medicalFile = await this.prismaService.medicalFile.create({
      data: {
        patientId: createMedicalFileDto.patientId,
        doctorId: createMedicalFileDto.doctorId,
        nurseId: createMedicalFileDto.nurseId,
        date: createMedicalFileDto.date,
        description: createMedicalFileDto.description,
        dischargeDate: createMedicalFileDto.dischargeDate,
        physicalExam: createMedicalFileDto.physicalExam,
        medicalHistory: createMedicalFileDto.medicalHistory,
        previousTreatment: createMedicalFileDto.previousTreatment,
        labResults: createMedicalFileDto.labResults,
        carePlan: createMedicalFileDto.carePlan,
      },
      //TODO: Manage the medicine asignation to a medical file
    });

    return medicalFile;
  }

  async findAll() {
    return await this.prismaService.medicalFile.findMany();
  }

  async findOne(id: number) {
    return await this.prismaService.medicalFile.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, updateMedicalFileDto: UpdateMedicalFileDto) {
    const medicalFile = await this.prismaService.medicalFile.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        doctorId: true,
        nurseId: true,
      },
    });

    if (!medicalFile) {
      throw new HttpException(
        "this medical file doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }

    const doctor = await this.prismaService.doctor.findUnique({
      where: {
        nationalId: updateMedicalFileDto.doctorId,
      },
      select: {
        nationalId: true,
      },
    });

    if (!doctor) {
      throw new HttpException(
        "this doctor doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }

    const nurse = await this.prismaService.nurse.findUnique({
      where: {
        nationalId: updateMedicalFileDto.nurseId,
      },
      select: {
        nationalId: true,
      },
    });

    if (!nurse) {
      throw new HttpException(
        "this nurse doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }

    const newMedFile = await this.prismaService.medicalFile.update({
      where: {
        id: id,
      },
      data: {
        doctorId: updateMedicalFileDto.doctorId,
        nurseId: updateMedicalFileDto.nurseId,
        date: updateMedicalFileDto.date,
        description: updateMedicalFileDto.description,
        dischargeDate: updateMedicalFileDto.dischargeDate,
        physicalExam: updateMedicalFileDto.physicalExam,
        medicalHistory: updateMedicalFileDto.medicalHistory,
        previousTreatment: updateMedicalFileDto.previousTreatment,
        labResults: updateMedicalFileDto.labResults,
        carePlan: updateMedicalFileDto.carePlan,
      },
    });

    return newMedFile;
  }

  async remove(id: number) {
    const medicalFile = await this.prismaService.medicalFile.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        doctorId: true,
        nurseId: true,
      },
    });

    if (!medicalFile) {
      throw new HttpException(
        "this medical file doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }

    return this.prismaService.medicalFile.delete({
      where: {
        id: id,
      },
    });
  }
}
