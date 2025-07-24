/*
  Warnings:

  - You are about to drop the `garden_flowers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "garden_flowers" DROP CONSTRAINT "garden_flowers_taskId_fkey";

-- DropForeignKey
ALTER TABLE "garden_flowers" DROP CONSTRAINT "garden_flowers_userId_fkey";

-- DropTable
DROP TABLE "garden_flowers";

-- DropEnum
DROP TYPE "FlowerType";
