import { Injectable } from '@nestjs/common';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AllergiesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(nationaId: string, createAllergyDto: CreateAllergyDto) {
    return await this.prismaService.patient.update({
      where: { nationalId: nationaId },
      data: {
        allergies: {
          push: createAllergyDto.name,
        },
      },
    });
  }

  async remove(nationalId: string, name: string) {
    const patient = await this.prismaService.patient.findUnique({
      where: { nationalId: nationalId },
      select: { allergies: true },
    });

    if (!patient) {
      return patient;
    }

    const { allergies } = patient;

    return await this.prismaService.patient.update({
      where: { nationalId: nationalId },
      data: {
        allergies: {
          set: allergies.filter((allergy) => allergy !== name),
        },
      },
    });
  }
}
