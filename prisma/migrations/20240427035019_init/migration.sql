-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PATIENT', 'NURSE', 'DOCTOR');

-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BANDAGE_CHANGE', 'MEDICATION_TIME', 'MONITORING_SIGNS_AND_SYMPTOMS', 'DISCHARHE');

-- CreateTable
CREATE TABLE "User" (
    "nationalId" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("nationalId")
);

-- CreateTable
CREATE TABLE "Nurse" (
    "nationalId" TEXT NOT NULL,
    "genre" "Genre" NOT NULL,
    "birthDate" DATE NOT NULL,
    "medicalCenter" TEXT NOT NULL,

    CONSTRAINT "Nurse_pkey" PRIMARY KEY ("nationalId")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "nationalId" TEXT NOT NULL,
    "genre" "Genre" NOT NULL,
    "birthDate" DATE NOT NULL,
    "medicalCenter" TEXT NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("nationalId")
);

-- CreateTable
CREATE TABLE "Patient" (
    "nationalId" TEXT NOT NULL,
    "genre" "Genre" NOT NULL,
    "birthDate" DATE NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "cellPhoneNumber" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "status" "PatientStatus" NOT NULL,
    "allergies" TEXT[],
    "medicalRecords" TEXT[],

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("nationalId")
);

-- CreateTable
CREATE TABLE "MedicalFile" (
    "id" SERIAL NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "dischargeDate" DATE,
    "physicalExam" TEXT[],
    "medicalHistory" TEXT[],
    "previousTreatment" TEXT[],
    "labResults" TEXT[],
    "carePlan" TEXT[],

    CONSTRAINT "MedicalFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BandageChange" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "nurseId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "BandageChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "medicalFileId" INTEGER NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER,
    "userId" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MedicalFileToMedicine" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalFile_patientId_date_key" ON "MedicalFile"("patientId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BandageChange_patientId_date_key" ON "BandageChange"("patientId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userId_nurseId_medicalFileId_key" ON "Conversation"("userId", "nurseId", "medicalFileId");

-- CreateIndex
CREATE UNIQUE INDEX "_MedicalFileToMedicine_AB_unique" ON "_MedicalFileToMedicine"("A", "B");

-- CreateIndex
CREATE INDEX "_MedicalFileToMedicine_B_index" ON "_MedicalFileToMedicine"("B");

-- AddForeignKey
ALTER TABLE "Nurse" ADD CONSTRAINT "Nurse_nationalId_fkey" FOREIGN KEY ("nationalId") REFERENCES "User"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_nationalId_fkey" FOREIGN KEY ("nationalId") REFERENCES "User"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_nationalId_fkey" FOREIGN KEY ("nationalId") REFERENCES "User"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalFile" ADD CONSTRAINT "MedicalFile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalFile" ADD CONSTRAINT "MedicalFile_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalFile" ADD CONSTRAINT "MedicalFile_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "Nurse"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BandageChange" ADD CONSTRAINT "BandageChange_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "Nurse"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BandageChange" ADD CONSTRAINT "BandageChange_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "Nurse"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_medicalFileId_fkey" FOREIGN KEY ("medicalFileId") REFERENCES "MedicalFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("nationalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicalFileToMedicine" ADD CONSTRAINT "_MedicalFileToMedicine_A_fkey" FOREIGN KEY ("A") REFERENCES "MedicalFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicalFileToMedicine" ADD CONSTRAINT "_MedicalFileToMedicine_B_fkey" FOREIGN KEY ("B") REFERENCES "Medicine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
