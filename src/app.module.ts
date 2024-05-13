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
import { MedicineModule } from './medicine/medicine.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UsersModule,
    PatientModule,
    AllergiesModule,
    MedicalHistoryModule,
    NurseModule,
    DoctorModule,
    MedicalFileModule,
    MedicineModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
