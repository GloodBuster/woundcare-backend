import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AllergiesService } from './allergies.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('patient/:nationalId/allergies')
@UseGuards(AuthGuard, RolesGuard)
@ApiTags('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  async create(
    @Param('nationaId') nationalId: string,
    @Body() createAllergyDto: CreateAllergyDto,
  ) {
    try {
      return await this.allergiesService.create(nationalId, createAllergyDto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Patient not found');
        }
      }
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Delete(':name')
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async remove(
    @Param('name') name: string,
    @Param('nationalId') nationalId: string,
  ) {
    try {
      const patient = await this.allergiesService.remove(nationalId, name);
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
