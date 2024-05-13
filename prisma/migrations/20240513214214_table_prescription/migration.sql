/*
  Warnings:

  - You are about to drop the `_MedicalFileToMedicine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MedicalFileToMedicine" DROP CONSTRAINT "_MedicalFileToMedicine_A_fkey";

-- DropForeignKey
ALTER TABLE "_MedicalFileToMedicine" DROP CONSTRAINT "_MedicalFileToMedicine_B_fkey";

-- DropTable
DROP TABLE "_MedicalFileToMedicine";

-- CreateTable
CREATE TABLE "Prescription" (
    "id" SERIAL NOT NULL,
    "medicalFileId" INTEGER NOT NULL,
    "medicineId" INTEGER NOT NULL,
    "dose" INTEGER NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_medicalFileId_medicineId_key" ON "Prescription"("medicalFileId", "medicineId");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicalFileId_fkey" FOREIGN KEY ("medicalFileId") REFERENCES "MedicalFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
