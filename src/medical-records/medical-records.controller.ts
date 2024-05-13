import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  InternalServerErrorException,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestWithUser } from 'src/common/interfaces/request.interface';

@Controller('patient')
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('medical-records')
@ApiBearerAuth()
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post('me/medical-records')
  @Roles(Role.PATIENT)
  @HttpCode(HttpStatus.CREATED)
  async createMe(
    @Request() req: RequestWithUser,
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
  ) {
    try {
      return await this.medicalRecordsService.create(
        req.user.nationalId,
        createMedicalRecordDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Delete('me/medical-records/:description')
  @Roles(Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async removeMe(
    @Request() req: RequestWithUser,
    @Param('description') description: string,
  ) {
    try {
      return await this.medicalRecordsService.remove(
        req.user.nationalId,
        description,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }
}
