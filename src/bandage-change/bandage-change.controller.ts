import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BandageChangeService } from './bandage-change.service';
import { CreateBandageChangeDto } from './dto/create-bandage-change.dto';
import {
  AlreadyExistsError,
  ForeignKeyError,
} from 'src/common/errors/service.error';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { BandageChangeDto } from './dto/create-bandage.dto';

@ApiTags('bandage-change')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('bandage-change')
export class BandageChangeController {
  constructor(private readonly bandageChangeService: BandageChangeService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createBandageChangeDto: CreateBandageChangeDto,
  ): Promise<BandageChangeDto> {
    try {
      return await this.bandageChangeService.create(createBandageChangeDto);
    } catch (error) {
      if (error instanceof AlreadyExistsError)
        throw new BadRequestException(error.message);
      if (error instanceof ForeignKeyError)
        throw new ConflictException(error.message);

      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }
}
