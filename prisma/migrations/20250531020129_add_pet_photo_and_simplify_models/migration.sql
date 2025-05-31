/*
  Warnings:

  - You are about to drop the column `activity` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `humidity` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `meals` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `Pet` table. All the data in the column will be lost.
  - You are about to drop the column `water` on the `Pet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "activity",
DROP COLUMN "humidity",
DROP COLUMN "meals",
DROP COLUMN "temperature",
DROP COLUMN "water",
ADD COLUMN     "photo" BYTEA;
