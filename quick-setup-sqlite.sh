#!/bin/bash
cd /Users/n/Code/creator

echo "🔧 Setting up SQLite with SystemSettings..."

# Add SystemSettings table
echo "📦 Adding SystemSettings table..."
sqlite3 prisma/dev.db "
CREATE TABLE IF NOT EXISTS SystemSettings (
    id TEXT NOT NULL PRIMARY KEY,
    generationInterval INTEGER NOT NULL DEFAULT 120,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO SystemSettings (id, generationInterval, updatedAt)
VALUES ('default', 120, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
"

# Generate Prisma Client
echo "🔨 Regenerating Prisma Client..."
npx prisma generate

# Clear Next.js cache
echo "🧹 Clearing cache..."
rm -rf .next

echo "✅ Done!"
echo ""
echo "Now run:"
echo "  npm run dev"

