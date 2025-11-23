-- Prisma Schema SQL for PostgreSQL
-- Run this in Prisma Cloud Dashboard SQL Editor or via psql

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Article table
CREATE TABLE IF NOT EXISTS "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT UNIQUE,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tags" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL,
    "source" TEXT,
    "sourceUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create GenerationLog table
CREATE TABLE IF NOT EXISTS "GenerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "articlesCreated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER
);

-- Create SystemSettings table
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "autoGenerationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "generationInterval" INTEGER NOT NULL DEFAULT 120,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Article_slug_idx" ON "Article"("slug");
CREATE INDEX IF NOT EXISTS "Article_isPublished_idx" ON "Article"("isPublished");
CREATE INDEX IF NOT EXISTS "Article_date_idx" ON "Article"("date");
CREATE INDEX IF NOT EXISTS "GenerationLog_startedAt_idx" ON "GenerationLog"("startedAt");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Verify tables created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('User', 'Article', 'GenerationLog', 'SystemSettings')
ORDER BY table_name;

