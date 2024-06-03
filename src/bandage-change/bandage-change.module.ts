import { Module } from '@nestjs/common';
import { BandageChangeService } from './bandage-change.service';
import { BandageChangeController } from './bandage-change.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BandageChangeController],
  providers: [BandageChangeService],
})
export class BandageChangeModule {}
