/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT', 'USER');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "name",
ADD COLUMN     "clerkId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Claims" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "policy_number" INTEGER NOT NULL,
    "address" TEXT,
    "po_box" INTEGER NOT NULL,
    "occupation" TEXT,
    "telephone" TEXT,

    CONSTRAINT "Claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Motor_Claims" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Motor_Claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buglary_Claims" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Buglary_Claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claims_policy_number_key" ON "Claims"("policy_number");

-- CreateIndex
CREATE UNIQUE INDEX "Claims_telephone_key" ON "Claims"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
