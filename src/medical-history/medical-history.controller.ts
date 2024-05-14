import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('patient/medical-file/:id/medical-history')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('medical-history')
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id', ParseIntPipe) id: number,
    @Body() createMedicalHistoryDto: CreateMedicalHistoryDto,
  ) {
    try {
      return await this.medicalHistoryService.create(
        id,
        createMedicalHistoryDto,
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Patient not found');
        }
      }
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Delete(':description')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('description') description: string,
  ) {
    try {
      const patient = await this.medicalHistoryService.remove(id, description);
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      return patient;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }
}
