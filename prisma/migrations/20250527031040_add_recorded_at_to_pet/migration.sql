/*
  Warnings:

  - Added the required column `recordedAt` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "recordedAt" TIMESTAMP(3) NOT NULL;
