/*
  Warnings:

  - You are about to drop the column `medicineId` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the `Medicine` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[medicalFileId,medicineName]` on the table `Prescription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `medicineDescription` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicineName` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_medicineId_fkey";

-- DropIndex
DROP INDEX "Prescription_medicalFileId_medicineId_key";

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "medicineId",
ADD COLUMN     "medicineDescription" TEXT NOT NULL,
ADD COLUMN     "medicineName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Medicine";

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_medicalFileId_medicineName_key" ON "Prescription"("medicalFileId", "medicineName");
