import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async login(nationalId: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(nationalId);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async verifyToken(token : string) {
    const payload = await this.jwtService.verifyAsync(token)
    const user = await this.usersService.findOne(payload.nationalId)
    if(!user){
      return null
    }
    const {password, ...result} = user
    
    return result
  }
}
