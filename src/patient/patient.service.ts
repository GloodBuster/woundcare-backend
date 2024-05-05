import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class PatientService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        nationalId: createPatientDto.nationalId,
      },
    });
    if (user) {
      throw new HttpException(
        'This patient already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(
      createPatientDto.password,
      Number(process.env.SALT_ROUNDS) || 10,
    );

    const patientUser = this.prismaService.user.create({
      data: {
        nationalId: createPatientDto.nationalId,
        fullname: createPatientDto.fullname,
        email: createPatientDto.email,
        password: hashedPassword,
        role: Role.PATIENT,
      },
    });

    const patient = this.prismaService.patient.create({
      data: {
        nationalId: (await patientUser).nationalId,
        genre: createPatientDto.genre,
        birthDate: createPatientDto.birthDate,
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
    });

    return patient;
  }

  async findAll() {
    const patients = this.prismaService.patient.findMany();
    return patients;
  }

  findOne(id: string) {
    const patient = this.prismaService.patient.findUnique({
      where: {
        nationalId: id,
      },
    });
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const user = await this.prismaService.patient.findUnique({
      where: {
        nationalId: id,
      },
    });

    if (!user) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

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
  }

  async remove(id: string) {
    const user = await this.prismaService.patient.findUnique({
      where: {
        nationalId: id,
      },
    });

    if (!user) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    await this.prismaService.patient.delete({
      where: {
        nationalId: id,
      },
    });

    return await this.prismaService.user.delete({
      where: {
        nationalId: id,
      },
    });
  }
}
