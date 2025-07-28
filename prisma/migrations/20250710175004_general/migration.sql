-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "size" TEXT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LaundryCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
