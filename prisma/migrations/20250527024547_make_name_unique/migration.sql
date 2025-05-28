/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Pet` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pet" ALTER COLUMN "meals" DROP DEFAULT,
ALTER COLUMN "water" DROP DEFAULT,
ALTER COLUMN "humidity" DROP DEFAULT,
ALTER COLUMN "activity" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Pet_name_key" ON "Pet"("name");
