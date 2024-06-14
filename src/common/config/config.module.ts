import { Module } from '@nestjs/common';
import { ConfigService } from 'src/common/config/config.service';

@Module({
  imports: [],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
