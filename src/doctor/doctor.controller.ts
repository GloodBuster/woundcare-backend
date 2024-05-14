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
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import {
  AlreadyExistsError,
  NotFoundError,
} from 'src/common/errors/service.error';

@ApiTags('Doctor')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDoctorDto: CreateDoctorDto) {
    try {
      return this.doctorService.create(createDoctorDto);
    } catch (error) {
      if (error instanceof AlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.doctorService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    try {
      return this.doctorService.update(id, updateDoctorDto);
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new NotFoundException(error.message);

      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    try {
      return this.doctorService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new NotFoundException(error.message);

      throw new InternalServerErrorException(error.message);
    }
  }
}
