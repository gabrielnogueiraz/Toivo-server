-- CreateEnum
CREATE TYPE "FlowerType" AS ENUM ('NORMAL', 'LEGENDARY');

-- CreateTable
CREATE TABLE "garden_flowers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "type" "FlowerType" NOT NULL DEFAULT 'NORMAL',
    "priority" "Priority" NOT NULL,
    "color" TEXT,
    "legendaryName" TEXT,
    "customName" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garden_flowers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "garden_flowers" ADD CONSTRAINT "garden_flowers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garden_flowers" ADD CONSTRAINT "garden_flowers_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
