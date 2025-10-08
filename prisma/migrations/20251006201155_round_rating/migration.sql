/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Round" ADD COLUMN "rating" INTEGER;
ALTER TABLE "Round" ADD COLUMN "totalStrokes" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");
