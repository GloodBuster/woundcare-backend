import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicineService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createMedicineDto: CreateMedicineDto) {
    const existentMedicine = await this.prismaService.medicine.findUnique({
      where: {
        name: createMedicineDto.name,
      },
      select: {
        id: true,
      },
    });

    if (existentMedicine) {
      throw new HttpException(
        'This medicine already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const medicine = await this.prismaService.medicine.create({
      data: {
        name: createMedicineDto.name,
        description: createMedicineDto.description,
      },
    });

    return medicine;
  }

  async findAll() {
    return await this.prismaService.medicine.findMany();
  }

  async findOneById(id: number) {
    return await this.prismaService.medicine.findUnique({
      where: {
        id: id,
      },
    });
  }

  async findOneByName(name: string) {
    return await this.prismaService.medicine.findUnique({
      where: {
        name: name,
      },
    });
  }

  async update(id: number, updateMedicineDto: UpdateMedicineDto) {
    const existentMedicine = await this.prismaService.medicine.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (existentMedicine?.id != id && existentMedicine) {
      throw new HttpException(
        'A medicine with this name already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const equalMedicine = await this.prismaService.medicine.findUnique({
      where: {
        id: id,
      },
    });

    if (!equalMedicine) {
      throw new HttpException(
        'There is no medicine with this Id',
        HttpStatus.NOT_FOUND,
      );
    }

    const medicine = await this.prismaService.medicine.update({
      where: {
        id: id,
      },
      data: {
        name: updateMedicineDto.name,
        description: updateMedicineDto.description,
      },
    });

    return medicine;
  }

  async remove(id: number) {
    const findMedicine = await this.prismaService.medicine.findUnique({
      where: {
        id: id,
      },
    });

    if (!findMedicine) {
      throw new HttpException(
        "a medicine with this id doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prismaService.medicine.delete({
      where: {
        id: id,
      },
    });
  }
}
