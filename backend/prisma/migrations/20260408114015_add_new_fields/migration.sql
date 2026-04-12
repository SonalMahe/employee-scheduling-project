/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[loginCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `loginCode` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Position" AS ENUM ('WAITER', 'RUNNER', 'HEAD_WAITER', 'ADMIN', 'CHEF');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "loginCode" TEXT NOT NULL,
ADD COLUMN     "position" "Position" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_loginCode_key" ON "User"("loginCode");
