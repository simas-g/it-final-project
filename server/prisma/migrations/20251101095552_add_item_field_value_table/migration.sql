-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE IF NOT EXISTS 'IMAGE_URL';

-- CreateTable
CREATE TABLE "ItemFieldValue" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemFieldValue_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "ItemFieldValue_itemId_fieldId_key" ON "ItemFieldValue"("itemId", "fieldId");

-- AddForeignKey
ALTER TABLE "ItemFieldValue" ADD CONSTRAINT "ItemFieldValue_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemFieldValue" ADD CONSTRAINT "ItemFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "InventoryField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable (Drop old fields column from InventoryItem)
ALTER TABLE "InventoryItem" DROP COLUMN IF EXISTS "fields";

