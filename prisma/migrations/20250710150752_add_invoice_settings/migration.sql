-- CreateTable
CREATE TABLE "InvoiceSettings" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT 'INV',
    "separator" TEXT NOT NULL DEFAULT '-',
    "yearFormat" TEXT NOT NULL DEFAULT 'YYYY',
    "includeMonth" BOOLEAN NOT NULL DEFAULT false,
    "monthFormat" TEXT NOT NULL DEFAULT 'MM',
    "includeDay" BOOLEAN NOT NULL DEFAULT false,
    "dayFormat" TEXT NOT NULL DEFAULT 'DD',
    "counterDigits" INTEGER NOT NULL DEFAULT 4,
    "counterStart" INTEGER NOT NULL DEFAULT 1,
    "currentCounter" INTEGER NOT NULL DEFAULT 1,
    "resetCounterYearly" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvoiceSettings" ADD CONSTRAINT "InvoiceSettings_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
