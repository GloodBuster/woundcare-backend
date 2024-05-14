import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { NotFoundError } from 'src/common/errors/service.error';

@Controller('prescription')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
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
  findAll() {
    return this.prescriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionService.findOne(+id);
  }

  @Delete(':id')
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
