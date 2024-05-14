import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/users.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@ApiTags('users')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async createAdminUser(
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<UserDto> {
    try {
      const user = await this.usersService.createAdminUser(createAdminDto);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }
}
