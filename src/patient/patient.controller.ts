import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  UseGuards,
  Request,
  ConflictException,
  NotFoundException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { RequestWithUser } from 'src/common/interfaces/request.interface';
import {
  AlreadyExistsError,
  NotFoundError,
} from 'src/common/errors/service.error';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { PatientDto } from './dto/patient.dto';

@Controller('patient')
@ApiTags('patient')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.NURSE)
  async create(@Body() createPatientDto: CreatePatientDto) {
    try {
      const patient = await this.patientService.create(createPatientDto);
      return patient;
    } catch (error) {
      if (error instanceof AlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.patientService.findAll();
  }

  @Get('active/nurse')
  @Roles(Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findNurseActivePatients(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<PatientDto>> {
    try {
      return await this.patientService.findActivePatientsPage(
        page,
        itemsPerPage,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get('inactive/nurse')
  @Roles(Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findNurseInactivePatients(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<PatientDto>> {
    try {
      return await this.patientService.findInactivePatientsPage(
        page,
        itemsPerPage,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get('active/doctor')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  async findDoctorActivePatients(
    @Request() req: RequestWithUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<PatientDto>> {
    try {
      return await this.patientService.findActiveDoctorPatientsPage(
        req.user.nationalId,
        page,
        itemsPerPage,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get('me')
  @Roles(Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async getMe(@Request() req: RequestWithUser) {
    return await this.patientService.findOne(req.user.nationalId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      const patient = await this.patientService.findOne(id);

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      return patient;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Patch('me')
  @Roles(Role.PATIENT)
  @HttpCode(HttpStatus.CREATED)
  async updateMe(
    @Request() req: RequestWithUser,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    try {
      return this.patientService.update(req.user.nationalId, updatePatientDto);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    try {
      return await this.patientService.update(id, updatePatientDto);
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new NotFoundException(error.message);

      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.NURSE)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    try {
      return await this.patientService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError(error.message);
      }
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }
}
