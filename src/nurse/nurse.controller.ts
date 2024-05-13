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
} from '@nestjs/common';
import { NurseService } from './nurse.service';
import { CreateNurseDto } from './dto/create-nurse.dto';
import { UpdateNurseDto } from './dto/update-nurse.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('nurse')
@ApiBearerAuth()
@Controller('nurse')
export class NurseController {
  constructor(private readonly nurseService: NurseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNurseDto: CreateNurseDto) {
    try {
      return await this.nurseService.create(createNurseDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.nurseService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.nurseService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.CREATED)
  async update(
    @Param('id') id: string,
    @Body() updateNurseDto: UpdateNurseDto,
  ) {
    try {
      return await this.nurseService.update(id, updateNurseDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.nurseService.remove(id);
  }
}