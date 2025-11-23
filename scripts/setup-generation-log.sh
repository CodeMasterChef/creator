#!/bin/bash
cd /Users/n/Code/creator

echo "📦 Applying migration..."
sqlite3 prisma/dev.db < prisma/migrations/20251123100000_add_generation_log/migration.sql

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Done! Please restart the server."

