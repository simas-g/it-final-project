-- AlterTable
ALTER TABLE "User" ADD COLUMN "salesforceAccountId" TEXT,
ADD COLUMN "salesforceContactId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_salesforceContactId_key" ON "User"("salesforceContactId");

