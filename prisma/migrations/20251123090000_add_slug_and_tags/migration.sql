-- AlterTable
ALTER TABLE "Article" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Article" ADD COLUMN "tags" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- Update existing records with a slug based on their ID
UPDATE "Article" SET "slug" = id WHERE "slug" = '';

