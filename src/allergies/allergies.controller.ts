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

@Controller('patient/:nationalId/allergies')
@ApiTags('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
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
