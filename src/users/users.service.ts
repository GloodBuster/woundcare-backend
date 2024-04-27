import { Injectable } from '@nestjs/common';
import { User } from '.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAdminUser(createAdminDto: CreateAdminDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(
      createAdminDto.password,
      Number(process.env.SALT_ROUNDS) || 10,
    );

    const user = await this.prismaService.user.create({
      data: {
        nationalId: createAdminDto.nationalId,
        email: createAdminDto.email,
        password: hashedPassword,
        fullname: createAdminDto.fullname,
        role: 'ADMIN',
      },
    });
    return user;
  }

  async findOne(nationalId: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        nationalId: nationalId,
      },
    });
    return user;
  }
}
