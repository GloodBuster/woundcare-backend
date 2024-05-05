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
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('patient')
@ApiTags('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async create(@Body() createPatientDto: CreatePatientDto) {
    try {
      const patient = await this.patientService.create(createPatientDto);
      return patient;
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.patientService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.patientService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    try {
      return await this.patientService.update(id, updatePatientDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return await this.patientService.remove(id);
  }
}
