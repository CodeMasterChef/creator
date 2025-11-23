#!/bin/bash
set -e

cd /Users/n/Code/creator

echo "============================================"
echo "🔧 Quick Fix: Creating All Tables"
echo "============================================"
echo ""

# Step 1: Create all tables
echo "📦 Creating tables in database..."
sqlite3 prisma/dev.db < create-all-tables.sql
echo "✅ All tables created"
echo ""

# Step 2: Verify tables
echo "🔍 Verifying tables..."
sqlite3 prisma/dev.db "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
echo ""

# Step 3: Seed admin user
echo "🌱 Creating admin user..."
npm run seed
echo ""

# Step 4: Clear cache
echo "🧹 Clearing cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

echo "============================================"
echo "✅ All Done! Database is ready."
echo "============================================"
echo ""
echo "Tables created:"
echo "  ✅ User"
echo "  ✅ Article"
echo "  ✅ GenerationLog"
echo "  ✅ SystemSettings"
echo ""
echo "Now run:"
echo "  npm run dev"

