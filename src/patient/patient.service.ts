import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PatientStatus, Role } from '@prisma/client';
import {
  AlreadyExistsError,
  NotFoundError,
  UnexpectedError,
} from 'src/common/errors/service.error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { PatientDto } from './dto/patient.dto';

@Injectable()
export class PatientService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    try {
      const hashedPassword = await bcrypt.hash(
        createPatientDto.password,
        Number(process.env.SALT_ROUNDS) || 10,
      );

      const [patientUser, patient] = await this.prismaService.$transaction([
        this.prismaService.user.create({
          data: {
            nationalId: createPatientDto.nationalId,
            fullname: createPatientDto.fullname,
            email: createPatientDto.email,
            password: hashedPassword,
            role: Role.PATIENT,
          },
        }),
        this.prismaService.patient.create({
          data: {
            nationalId: createPatientDto.nationalId,
            genre: createPatientDto.genre,
            birthDate: new Date(createPatientDto.birthDate).toISOString(),
            address: createPatientDto.adress,
            phoneNumber: createPatientDto.phoneNumber,
            cellPhoneNumber: createPatientDto.cellPhoneNumber,
            photo: createPatientDto.photo,
            bloodType: createPatientDto.bloodType,
            weight: createPatientDto.weight,
            height: createPatientDto.height,
            status: createPatientDto.status,
            allergies: createPatientDto.allergies,
            medicalRecords: createPatientDto.medicalRecord,
          },
        }),
      ]);

      return patient;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AlreadyExistsError(
            `a patient with the id ${createPatientDto.nationalId} already exists`,
            { cause: error },
          );
        }
      }
      throw new UnexpectedError(error.message, { cause: error });
    }
  }

  async findActiveDoctorPatientsPage(
    doctorId: string,
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<PatientDto>> {
    try {
      const [patientsCount, patients] = await this.prismaService.$transaction([
        this.prismaService.patient.count({
          where: {
            status: PatientStatus.ACTIVE,
            MedicalFile: {
              some: {
                doctorId,
              },
            },
          },
        }),
        this.prismaService.patient.findMany({
          where: {
            status: PatientStatus.ACTIVE,
            MedicalFile: {
              some: {
                doctorId,
              },
            },
          },
          take: itemsPerPage,
          skip: (page - 1) * itemsPerPage,
          include: {
            user: {
              select: {
                fullname: true,
              },
            },
          },
        }),
      ]);
      return {
        items: patients,
        meta: {
          totalItems: patientsCount,
          totalPages: Math.ceil(patientsCount / itemsPerPage),
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

  async findActivePatientsPage(
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<PatientDto>> {
    try {
      const [patientsCount, patients] = await this.prismaService.$transaction([
        this.prismaService.patient.count({
          where: {
            status: PatientStatus.ACTIVE,
          },
        }),
        this.prismaService.patient.findMany({
          where: {
            status: PatientStatus.ACTIVE,
          },
          take: itemsPerPage,
          skip: (page - 1) * itemsPerPage,
          include: {
            user: {
              select: {
                fullname: true,
              },
            },
          },
        }),
      ]);
      return {
        items: patients,
        meta: {
          totalItems: patientsCount,
          totalPages: Math.ceil(patientsCount / itemsPerPage),
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

  async findInactivePatientsPage(
    page: number,
    itemsPerPage: number,
  ): Promise<PaginatedResponse<PatientDto>> {
    try {
      const [patientsCount, patients] = await this.prismaService.$transaction([
        this.prismaService.patient.count({
          where: {
            status: PatientStatus.INACTIVE,
          },
        }),
        this.prismaService.patient.findMany({
          where: {
            status: PatientStatus.INACTIVE,
          },
          take: itemsPerPage,
          skip: (page - 1) * itemsPerPage,
          include: {
            user: {
              select: {
                fullname: true,
              },
            },
          },
        }),
      ]);
      return {
        items: patients,
        meta: {
          totalItems: patientsCount,
          totalPages: Math.ceil(patientsCount / itemsPerPage),
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

  async findAll() {
    const patients = this.prismaService.patient.findMany({
      include: {
        user: {
          select: {
            fullname: true,
          },
        },
      },
    });
    return patients;
  }

  findOne(id: string) {
    const patient = this.prismaService.patient.findUnique({
      where: {
        nationalId: id,
      },
      include: {
        user: {
          select: {
            fullname: true,
          },
        },
      },
    });
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    try {
      return await this.prismaService.patient.update({
        where: {
          nationalId: id,
        },
        data: {
          address: updatePatientDto.adress,
          phoneNumber: updatePatientDto.phoneNumber,
          cellPhoneNumber: updatePatientDto.cellPhoneNumber,
          photo: updatePatientDto.photo,
          bloodType: updatePatientDto.bloodType,
          weight: updatePatientDto.weight,
          height: updatePatientDto.height,
          allergies: updatePatientDto.allergies,
          medicalRecords: updatePatientDto.medicalRecord,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError(`there is no patient with the id ${id}`, {
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
      const [patient, patientUser] = await this.prismaService.$transaction([
        this.prismaService.patient.delete({
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

      return patient;
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
