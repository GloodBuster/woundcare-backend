import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBandageChangeDto } from './dto/create-bandage-change.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  AlreadyExistsError,
  ForeignKeyError,
  UnexpectedError,
} from 'src/common/errors/service.error';
import { BandageChange } from '@prisma/client';

@Injectable()
export class BandageChangeService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createBandageChangeDto: CreateBandageChangeDto,
  ): Promise<BandageChange> {
    try {
      return await this.prismaService.bandageChange.create({
        data: {
          date: new Date(createBandageChangeDto.date).toISOString(),
          nurseId: createBandageChangeDto.nurseId,
          patientId: createBandageChangeDto.patientId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new ForeignKeyError('Patient or nurse not found');
        if (error.code === 'P2002')
          throw new AlreadyExistsError(
            'The patient already has a bandage change on this date',
          );
      }
      throw new UnexpectedError('An unexpected error ocurred', {
        cause: error,
      });
    }
  }
}
