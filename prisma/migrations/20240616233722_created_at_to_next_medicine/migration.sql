/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Prescription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "createdAt",
ADD COLUMN     "nextMedicine" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
