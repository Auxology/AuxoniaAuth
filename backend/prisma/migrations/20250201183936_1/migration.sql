/*
  Warnings:

  - A unique constraint covering the columns `[sid]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `data` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sid` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "data" TEXT NOT NULL,
ADD COLUMN     "sid" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "previousEmails" TEXT[],
ADD COLUMN     "previousPasswords" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE INDEX "session_sid_idx" ON "Session"("sid");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
