import { Module } from '@nestjs/common';
import { MedicalFileService } from './medical-file.service';
import { MedicalFileController } from './medical-file.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MedicalFileController],
  providers: [MedicalFileService],
  exports: [MedicalFileService],
})
export class MedicalFileModule {}
