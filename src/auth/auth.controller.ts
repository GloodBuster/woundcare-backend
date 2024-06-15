import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const loginResponse = await this.authService.login(
        loginDto.nationalId,
        loginDto.password,
      );
      if (!loginResponse) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return loginResponse;
    } catch (error) {
      if (error instanceof UnauthorizedException)
        throw new UnauthorizedException(error.message);

      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }
}
