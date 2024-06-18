import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async login(nationalId: string, password: string): Promise<LoginResponseDto | null> {
    const user = await this.usersService.findOne(nationalId);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const token = await this.jwtService.signAsync({
      nationalId: user.nationalId,
    });

    return {
      token,
      role: user.role,
    };
  }

  async verifyToken(token : string) {
    try {
      const payload = await this.jwtService.verifyAsync(token)
      const user = await this.usersService.findOne(payload.nationalId)
      if(!user){
        return null
      }
      const {password, ...result} = user
      
      return result
    } catch (error) {
    }
  }
}
