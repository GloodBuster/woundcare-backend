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

@Controller('prescription')
@ApiTags('Prescription')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    try {
      return this.prescriptionService.create(createPrescriptionDto);
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
  findAll() {
    return this.prescriptionService.findAll();
  }

  @Get('me')
  @Roles(Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async findPrescriptionForMe(@Request() req: RequestWithUser) {
    const medicines = this.prescriptionService.findPrescriptionForPatient(
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
  findOne(@Param('PatientId') patientId: string) {
    return this.prescriptionService.findPrescriptionForPatient(patientId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    try {
      return this.prescriptionService.remove(+id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
