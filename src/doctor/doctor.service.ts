import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createDoctorDto: CreateDoctorDto) {
    const searchUser = await this.prismaService.user.findUnique({
      select: {
        nationalId: true,
      },
      where: {
        nationalId: createDoctorDto.nationalId,
      },
    });

    if (searchUser) {
      throw new HttpException(
        'this doctor already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(
      createDoctorDto.password,
      Number(process.env.SALT_ROUNDS) || 10,
    );

    const user = await this.prismaService.user.create({
      data: {
        nationalId: createDoctorDto.nationalId,
        fullname: createDoctorDto.fullname,
        email: createDoctorDto.email,
        password: hashedPassword,
        role: Role.DOCTOR,
      },
    });

    const doctor = await this.prismaService.doctor.create({
      data: {
        nationalId: user.nationalId,
        genre: createDoctorDto.genre,
        birthDate: createDoctorDto.birthDate,
        medicalCenter: createDoctorDto.medicalCenter,
      },
    });

    return doctor;
  }

  async findAll() {
    return await this.prismaService.doctor.findMany();
  }

  async findOne(id: string) {
    return await this.prismaService.doctor.findUnique({
      where: {
        nationalId: id,
      },
    });
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const searchUser = await this.prismaService.doctor.findUnique({
      select: {
        nationalId: true,
      },
      where: {
        nationalId: id,
      },
    });

    if (!searchUser) {
      throw new HttpException(
        "this doctor doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }

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
  }

  async remove(id: string) {
    const doctor = await this.prismaService.doctor.findUnique({
      where: {
        nationalId: id,
      },
    });

    if (!doctor) {
      throw new HttpException(
        'this doctor already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prismaService.doctor.delete({
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
