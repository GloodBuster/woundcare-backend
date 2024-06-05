import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { NotFoundError } from 'src/common/errors/service.error';
import { RequestWithUser } from 'src/common/interfaces/request.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Controller('prescription')
@ApiTags('Prescription')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    try {
      return await this.prescriptionService.create(createPrescriptionDto);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.prescriptionService.findAll();
  }

  @Get('me')
  @Roles(Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async findPrescriptionForMe(@Request() req: RequestWithUser) {
    const medicines = await this.prescriptionService.findPrescriptionForPatient(
      req.user.nationalId,
    );

    if (!medicines)
      throw new NotFoundException(
        'There are no medicines asigned to this patient',
      );
    return medicines;
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('PatientId') patientId: string) {
    return await this.prescriptionService.findPrescriptionForPatient(patientId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id') id: string ,@Body() updatePrescriptionDto: UpdatePrescriptionDto) {
    try {
      return await this.prescriptionService.update(+id, updatePrescriptionDto)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    try {
      return await this.prescriptionService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
