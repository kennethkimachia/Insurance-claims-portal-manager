/*
  Warnings:

  - You are about to drop the `Buglary_Claims` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[claim_id]` on the table `Motor_Claims` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vehicle_registration_no]` on the table `Motor_Claims` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `claim_id` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_accident` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_of_accident` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_of_damage` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `driver_license_no` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `driver_name` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location_of_accident` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_make` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_model` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_registration_no` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_year` to the `Motor_Claims` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE SEQUENCE motor_claims_id_seq;
ALTER TABLE "Motor_Claims" ADD COLUMN     "claim_id" INTEGER NOT NULL,
ADD COLUMN     "date_of_accident" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description_of_accident" TEXT NOT NULL,
ADD COLUMN     "description_of_damage" TEXT NOT NULL,
ADD COLUMN     "driver_license_no" TEXT NOT NULL,
ADD COLUMN     "driver_name" TEXT NOT NULL,
ADD COLUMN     "estimated_repair_cost" DECIMAL(65,30),
ADD COLUMN     "location_of_accident" TEXT NOT NULL,
ADD COLUMN     "police_report_filed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "police_report_number" TEXT,
ADD COLUMN     "police_station" TEXT,
ADD COLUMN     "third_party_details" TEXT,
ADD COLUMN     "third_party_involved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vehicle_make" TEXT NOT NULL,
ADD COLUMN     "vehicle_model" TEXT NOT NULL,
ADD COLUMN     "vehicle_registration_no" TEXT NOT NULL,
ADD COLUMN     "vehicle_year" INTEGER NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('motor_claims_id_seq');
ALTER SEQUENCE motor_claims_id_seq OWNED BY "Motor_Claims"."id";

-- DropTable
DROP TABLE "Buglary_Claims";

-- CreateTable
CREATE TABLE "Burglary_Claims" (
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

    CONSTRAINT "Burglary_Claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stolen_Item" (
    "id" SERIAL NOT NULL,
    "burglary_claim_id" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_description" TEXT,
    "purchase_date" TIMESTAMP(3),
    "estimated_value" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Stolen_Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Burglary_Claims_claim_id_key" ON "Burglary_Claims"("claim_id");

-- CreateIndex
CREATE UNIQUE INDEX "Motor_Claims_claim_id_key" ON "Motor_Claims"("claim_id");

-- CreateIndex
CREATE UNIQUE INDEX "Motor_Claims_vehicle_registration_no_key" ON "Motor_Claims"("vehicle_registration_no");

-- AddForeignKey
ALTER TABLE "Motor_Claims" ADD CONSTRAINT "Motor_Claims_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "Claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Burglary_Claims" ADD CONSTRAINT "Burglary_Claims_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "Claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stolen_Item" ADD CONSTRAINT "Stolen_Item_burglary_claim_id_fkey" FOREIGN KEY ("burglary_claim_id") REFERENCES "Burglary_Claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
