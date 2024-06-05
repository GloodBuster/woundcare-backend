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
  NotFoundException,
  ConflictException,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NurseService } from './nurse.service';
import { CreateNurseDto } from './dto/create-nurse.dto';
import { UpdateNurseDto } from './dto/update-nurse.dto';
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
import { NurseDto } from './dto/nurse.dto';

@ApiTags('nurse')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('nurse')
export class NurseController {
  constructor(private readonly nurseService: NurseService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNurseDto: CreateNurseDto) {
    try {
      const nurse = await this.nurseService.create(createNurseDto);
      return nurse;
    } catch (error) {
      if (error instanceof AlreadyExistsError)
        throw new ConflictException(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findNursesPage(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('per-page', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
  ): Promise<PaginatedResponse<NurseDto>> {
    try {
      return await this.nurseService.findNursesPage(page, itemsPerPage);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get('me')
  @Roles(Role.NURSE)
  @HttpCode(HttpStatus.OK)
  async findMe(@Request() req: RequestWithUser) {
    try {
      return await this.nurseService.findOne(req.user.nationalId);
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
  @Roles(Role.ADMIN, Role.NURSE, Role.DOCTOR, Role.PATIENT)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.nurseService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async update(
    @Param('id') id: string,
    @Body() updateNurseDto: UpdateNurseDto,
  ) {
    try {
      return await this.nurseService.update(id, updateNurseDto);
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new NotFoundException(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    try {
      return await this.nurseService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundError)
        throw new NotFoundException(error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
