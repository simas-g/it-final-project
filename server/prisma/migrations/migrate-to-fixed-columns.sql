-- Step 1: Add new columns to InventoryItem
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "text1" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "text2" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "text3" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "multiText1" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "multiText2" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "multiText3" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "numeric1" DECIMAL(65,30);
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "numeric2" DECIMAL(65,30);
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "numeric3" DECIMAL(65,30);
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "image1" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "image2" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "image3" TEXT;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "boolean1" BOOLEAN;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "boolean2" BOOLEAN;
ALTER TABLE "InventoryItem" ADD COLUMN IF NOT EXISTS "boolean3" BOOLEAN;

-- Step 2: Add columnName to InventoryField (allowing NULL temporarily)
ALTER TABLE "InventoryField" ADD COLUMN IF NOT EXISTS "columnName" TEXT;

-- Step 3: Migrate data - this will be done in a Node.js script
-- See migrate-data.js

-- Step 4: Make columnName required after data migration
-- ALTER TABLE "InventoryField" ALTER COLUMN "columnName" SET NOT NULL;

-- Step 5: Drop old fields column after data migration
-- ALTER TABLE "InventoryItem" DROP COLUMN IF EXISTS "fields";

