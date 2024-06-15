import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/common/config/config.service';
import { ConfigModule } from 'src/common/config/config.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        console.log(
          'configService.getJwtSecret()',
          configService.getJwtSecret(),
        );

        return {
          secret: configService.getJwtSecret() || '4gfDCcu2Y29vyc*MsTyzDA49E',
          signOptions: { expiresIn: configService.getJwtExpiration() },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
