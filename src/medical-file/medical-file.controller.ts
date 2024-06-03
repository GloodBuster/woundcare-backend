import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { MedicalFileService } from './medical-file.service';
import { CreateMedicalFileDto } from './dto/create-medical-file.dto';
import { UpdateMedicalFileDto } from './dto/update-medical-file.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('medical-file')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('medical-file')
export class MedicalFileController {
  constructor(private readonly medicalFileService: MedicalFileService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMedicalFileDto: CreateMedicalFileDto) {
    try {
      return this.medicalFileService.create(createMedicalFileDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.medicalFileService.findAll();
  }

  @Get('patient/:nationalId')
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  async findByPatient(@Param('nationalId') nationalId: string) {
    try {
      const medicalFile =
        await this.medicalFileService.findOneByPatientId(nationalId);
      if (!medicalFile) {
        throw new NotFoundException('Medical file not found');
      }
      return medicalFile;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.medicalFileService.findOne(+id);
  }

  @Patch('patient/:nationalId/discharge')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async dischargePatient(@Param('nationalId') nationalId: string) {
    try {
      await this.medicalFileService.dischargePatient(nationalId);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  update(
    @Param('id') id: string,
    @Body() updateMedicalFileDto: UpdateMedicalFileDto,
  ) {
    try {
      return this.medicalFileService.update(+id, updateMedicalFileDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.medicalFileService.remove(+id);
  }
}
