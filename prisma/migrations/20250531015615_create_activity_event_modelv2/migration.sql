/*
  Warnings:

  - You are about to drop the column `duration` on the `ActivityEvent` table. All the data in the column will be lost.
  - You are about to drop the column `intensity` on the `ActivityEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ActivityEvent" DROP COLUMN "duration",
DROP COLUMN "intensity";
