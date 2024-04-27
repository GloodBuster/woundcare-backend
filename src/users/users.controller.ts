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

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
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
