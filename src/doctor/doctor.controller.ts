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
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
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
import { RequestWithUser } from 'src/common/interfaces/request.interface';
import { PaginatedResponse } from 'src/common/responses/paginatedResponse';
import { DoctorDto } from './dto/doctor.dto';

@ApiTags('Doctor')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    try {
      return await this.doctorService.create(createDoctorDto);
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
  async findDoctorsPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<DoctorDto>> {
    try {
      return await this.doctorService.findDoctorsPage(page, itemsPerPage);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get('me')
  @Roles(Role.DOCTOR)
  @HttpCode(HttpStatus.OK)
  async findMe(@Request() req: RequestWithUser) {
    try {
      return this.doctorService.findOne(req.user.nationalId);
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected situation ocurred',
        {
          cause: error,
        },
      );
    }
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      const doctor = await this.doctorService.findOne(id);
      if (!doctor) throw new NotFoundException('Doctor not found');
      return doctor;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(error.message);
    }
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
