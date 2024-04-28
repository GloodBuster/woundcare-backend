import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const user = await this.authService.login(
        loginDto.nationalId,
        loginDto.password,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = await this.jwtService.signAsync({
        nationalId: user.nationalId,
      });

      return {
        token: token,
        role: user.role,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException)
        throw new UnauthorizedException(error.message);

      throw new InternalServerErrorException(error.message, { cause: error });
    }
  }
}
