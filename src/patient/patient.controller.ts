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
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('patient')
@ApiTags('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatientDto: CreatePatientDto) {
    const patient = await this.patientService.create(createPatientDto);
    return patient;
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
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return await this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.patientService.remove(id);
  }
}
