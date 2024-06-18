import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AllergiesModule } from './allergies/allergies.module';
import { MedicalHistoryModule } from './medical-history/medical-history.module';
import { PatientModule } from './patient/patient.module';
import { NurseModule } from './nurse/nurse.module';
import { DoctorModule } from './doctor/doctor.module';
import { MedicalFileModule } from './medical-file/medical-file.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { ChatModule } from './chat/chat.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { BandageChangeModule } from './bandage-change/bandage-change.module';
import { ConfigModule as CustomConfigModule } from './common/config/config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    CustomConfigModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/public/'),
      serveStaticOptions: { index: false },
    }),
    AuthModule,
    UsersModule,
    PatientModule,
    AllergiesModule,
    MedicalHistoryModule,
    NurseModule,
    DoctorModule,
    MedicalFileModule,
    NotificationsModule,
    MedicalRecordsModule,
    PrescriptionModule,
    ChatModule,
    ConversationsModule,
    MessagesModule,
    BandageChangeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
