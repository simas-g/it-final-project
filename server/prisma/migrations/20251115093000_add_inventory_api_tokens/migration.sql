ALTER TABLE "Inventory"
ADD COLUMN "apiTokenHash" TEXT,
ADD COLUMN "apiTokenGeneratedAt" TIMESTAMP(3),
ADD COLUMN "apiTokenLastUsedAt" TIMESTAMP(3);

