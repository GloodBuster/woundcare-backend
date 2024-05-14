/*
  Warnings:

  - Added the required column `lapse` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "lapse" INTEGER NOT NULL;
