import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MedicalFileService } from './medical-file.service';
import { CreateMedicalFileDto } from './dto/create-medical-file.dto';
import { UpdateMedicalFileDto } from './dto/update-medical-file.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('medical-file')
@ApiBearerAuth()
@Controller('medical-file')
export class MedicalFileController {
  constructor(private readonly medicalFileService: MedicalFileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMedicalFileDto: CreateMedicalFileDto) {
    try {
      return this.medicalFileService.create(createMedicalFileDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.medicalFileService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.medicalFileService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.CREATED)
  update(
    @Param('id') id: string,
    @Body() updateMedicalFileDto: UpdateMedicalFileDto,
  ) {
    try {
      return this.medicalFileService.update(+id, updateMedicalFileDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.medicalFileService.remove(+id);
  }
}
