/*
  Warnings:

  - You are about to drop the `Burglary_Claims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Claims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Motor_Claims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stolen_Item` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('MOTOR', 'BURGLARY');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('MOTOR', 'BURGLARY');

-- DropForeignKey
ALTER TABLE "Burglary_Claims" DROP CONSTRAINT "Burglary_Claims_claim_id_fkey";

-- DropForeignKey
ALTER TABLE "Motor_Claims" DROP CONSTRAINT "Motor_Claims_claim_id_fkey";

-- DropForeignKey
ALTER TABLE "Stolen_Item" DROP CONSTRAINT "Stolen_Item_burglary_claim_id_fkey";

-- DropTable
DROP TABLE "Burglary_Claims";

-- DropTable
DROP TABLE "Claims";

-- DropTable
DROP TABLE "Motor_Claims";

-- DropTable
DROP TABLE "Stolen_Item";

-- CreateTable
CREATE TABLE "Policy" (
    "id" SERIAL NOT NULL,
    "policy_number" TEXT NOT NULL,
    "type" "PolicyType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" SERIAL NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "claim_type" "ClaimType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "policyId" INTEGER NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotorClaim" (
    "id" SERIAL NOT NULL,
    "claim_id" INTEGER NOT NULL,
    "date_of_accident" TIMESTAMP(3) NOT NULL,
    "location_of_accident" TEXT NOT NULL,
    "description_of_accident" TEXT NOT NULL,
    "vehicle_make" TEXT NOT NULL,
    "vehicle_model" TEXT NOT NULL,
    "vehicle_year" INTEGER NOT NULL,
    "vehicle_registration_no" TEXT NOT NULL,
    "driver_name" TEXT NOT NULL,
    "driver_license_no" TEXT NOT NULL,
    "third_party_involved" BOOLEAN NOT NULL DEFAULT false,
    "third_party_details" TEXT,
    "police_report_filed" BOOLEAN NOT NULL DEFAULT false,
    "police_station" TEXT,
    "police_report_number" TEXT,
    "description_of_damage" TEXT NOT NULL,
    "estimated_repair_cost" DECIMAL(65,30),

    CONSTRAINT "MotorClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BurglaryClaim" (
    "id" SERIAL NOT NULL,
    "claim_id" INTEGER NOT NULL,
    "date_of_loss" TIMESTAMP(3) NOT NULL,
    "date_of_discovery" TIMESTAMP(3) NOT NULL,
    "description_of_incident" TEXT NOT NULL,
    "police_report_filed" BOOLEAN NOT NULL DEFAULT false,
    "police_station" TEXT,
    "police_report_number" TEXT,
    "property_damaged" BOOLEAN NOT NULL DEFAULT false,
    "damage_description" TEXT,
    "estimated_repair_cost" DECIMAL(65,30),

    CONSTRAINT "BurglaryClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StolenItem" (
    "id" SERIAL NOT NULL,
    "burglary_claim_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_description" TEXT,
    "purchase_date" TIMESTAMP(3),
    "estimated_value" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "StolenItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policy_number_key" ON "Policy"("policy_number");

-- CreateIndex
CREATE UNIQUE INDEX "MotorClaim_claim_id_key" ON "MotorClaim"("claim_id");

-- CreateIndex
CREATE UNIQUE INDEX "BurglaryClaim_claim_id_key" ON "BurglaryClaim"("claim_id");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotorClaim" ADD CONSTRAINT "MotorClaim_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BurglaryClaim" ADD CONSTRAINT "BurglaryClaim_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "Claim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StolenItem" ADD CONSTRAINT "StolenItem_burglary_claim_id_fkey" FOREIGN KEY ("burglary_claim_id") REFERENCES "BurglaryClaim"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
