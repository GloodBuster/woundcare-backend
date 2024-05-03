import { Injectable } from '@nestjs/common';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicalHistoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(id: number, createMedicalHistoryDto: CreateMedicalHistoryDto) {
    return await this.prismaService.medicalFile.update({
      where: { id },
      data: {
        medicalHistory: {
          push: createMedicalHistoryDto.description,
        },
      },
    });
  }

  async remove(id: number, description: string) {
    const medicalFile = await this.prismaService.medicalFile.findUnique({
      where: { id },
      select: { medicalHistory: true },
    });

    if (!medicalFile) {
      return medicalFile;
    }

    const { medicalHistory } = medicalFile;

    return await this.prismaService.medicalFile.update({
      where: { id },
      data: {
        medicalHistory: {
          set: medicalHistory.filter((history) => history !== description),
        },
      },
    });
  }
}
