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

  @Get(':id')
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.patientService.findOne(id);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Request() req: RequestWithUser) {
    return await this.patientService.findOne(req.user.nationalId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.NURSE)
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

  @Patch('me')
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
