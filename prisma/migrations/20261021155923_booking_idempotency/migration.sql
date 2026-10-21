/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,idempotencyKey]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "idempotencyHash" TEXT,
ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_tenantId_idempotencyKey_key" ON "Booking"("tenantId", "idempotencyKey");
