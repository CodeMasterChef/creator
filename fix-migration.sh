#!/bin/bash
cd /Users/n/Code/creator

echo "🔧 Fixing database schema..."

# Apply SQL migration
echo "📦 Adding SystemSettings table..."
sqlite3 prisma/dev.db < add_system_settings.sql

# Generate Prisma Client
echo "🔨 Regenerating Prisma Client..."
npx prisma generate

echo "✅ Done!"
echo ""
echo "Now restart the server:"
echo "  pkill -f 'next dev'"
echo "  npm run dev"

