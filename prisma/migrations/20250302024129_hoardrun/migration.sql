/*
  Warnings:

  - You are about to drop the column `autoSave` on the `SavingsGoal` table. All the data in the column will be lost.
  - You are about to drop the column `autoSaveAmount` on the `SavingsGoal` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `SavingsGoal` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `SavingsGoal` table. All the data in the column will be lost.
  - Added the required column `category` to the `SavingsGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyContribution` to the `SavingsGoal` table without a default value. This is not possible if the table is not empty.
  - Made the column `deadline` on table `SavingsGoal` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SavingsGoal" DROP CONSTRAINT "SavingsGoal_userId_fkey";

-- AlterTable
ALTER TABLE "SavingsGoal" DROP COLUMN "autoSave",
DROP COLUMN "autoSaveAmount",
DROP COLUMN "frequency",
DROP COLUMN "status",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "isAutoSave" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "monthlyContribution" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "deadline" SET NOT NULL;

-- DropEnum
DROP TYPE "SavingsFrequency";

-- DropEnum
DROP TYPE "SavingsStatus";

-- CreateTable
CREATE TABLE "SavingsContribution" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MANUAL',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavingsContribution_goalId_idx" ON "SavingsContribution"("goalId");

-- CreateIndex
CREATE INDEX "SavingsGoal_userId_idx" ON "SavingsGoal"("userId");

-- AddForeignKey
ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsContribution" ADD CONSTRAINT "SavingsContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "SavingsGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
