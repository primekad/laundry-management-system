/*
  Warnings:

  - You are about to drop the column `serviceId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_serviceId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "serviceId";

-- DropTable
DROP TABLE "Service";
