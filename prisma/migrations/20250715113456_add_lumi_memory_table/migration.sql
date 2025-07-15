-- CreateEnum
CREATE TYPE "ImportanceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('PERSONAL_INFO', 'PERSONAL_CONTEXT', 'WORK_CONTEXT', 'STUDY_CONTEXT', 'PRODUCTIVITY_PATTERN', 'EMOTIONAL_STATE', 'COMMUNICATION_STYLE', 'GOALS_PROJECTS', 'PREFERENCES', 'IMPORTANT_DATES', 'FEEDBACK');

-- CreateTable
CREATE TABLE "LumiMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MemoryType" NOT NULL,
    "content" TEXT NOT NULL,
    "importance" "ImportanceLevel" NOT NULL DEFAULT 'MEDIUM',
    "emotionalContext" TEXT,
    "productivityPattern" TEXT,
    "communicationStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "LumiMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LumiMemory_importance_idx" ON "LumiMemory"("importance");

-- CreateIndex
CREATE INDEX "LumiMemory_type_idx" ON "LumiMemory"("type");

-- CreateIndex
CREATE INDEX "LumiMemory_userId_idx" ON "LumiMemory"("userId");

-- AddForeignKey
ALTER TABLE "LumiMemory" ADD CONSTRAINT "LumiMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
