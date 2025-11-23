-- Migration: Add SystemSettings table
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationInterval" INTEGER NOT NULL DEFAULT 120,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO "SystemSettings" ("id", "generationInterval", "updatedAt")
VALUES ('default', 120, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

