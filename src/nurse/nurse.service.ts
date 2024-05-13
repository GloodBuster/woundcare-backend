import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNurseDto } from './dto/create-nurse.dto';
import { UpdateNurseDto } from './dto/update-nurse.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class NurseService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createNurseDto: CreateNurseDto) {
    const searchUser = await this.prismaService.user.findUnique({
      select: {
        nationalId: true,
      },
      where: {
        nationalId: createNurseDto.nationalId,
      },
    });

    if (searchUser) {
      throw new HttpException(
        'this nurse already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(
      createNurseDto.password,
      Number(process.env.SALT_ROUNDS) || 10,
    );

    const user = await this.prismaService.user.create({
      data: {
        nationalId: createNurseDto.nationalId,
        fullname: createNurseDto.fullname,
        email: createNurseDto.email,
        password: hashedPassword,
        role: Role.NURSE,
      },
    });

    const nurse = await this.prismaService.nurse.create({
      data: {
        nationalId: user.nationalId,
        genre: createNurseDto.genre,
        birthDate: createNurseDto.birthDate,
        medicalCenter: createNurseDto.medicalCenter,
      },
    });

    return nurse;
  }

  async findAll() {
    return await this.prismaService.nurse.findMany();
  }

  async findOne(id: string) {
    return await this.prismaService.nurse.findUnique({
      where: {
        nationalId: id,
      },
    });
  }

  async update(id: string, updateNurseDto: UpdateNurseDto) {
    const searchUser = await this.prismaService.nurse.findUnique({
      select: {
        nationalId: true,
      },
      where: {
        nationalId: id,
      },
    });

    if (!searchUser) {
      throw new HttpException(
        "this nurse doesn't exists",
        HttpStatus.NOT_FOUND,
      );
    }

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
  }

  async remove(id: string) {
    const nurse = await this.prismaService.nurse.findUnique({
      where: {
        nationalId: id,
      },
    });

    if (!nurse) {
      throw new HttpException(
        'this nurse already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prismaService.nurse.delete({
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
