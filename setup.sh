#!/bin/bash
set -e

cd /Users/n/Code/creator

echo "============================================"
echo "🔧 Setting up SystemSettings for SQLite"
echo "============================================"
echo ""

# Step 1: Add table to database
echo "📦 Step 1/4: Adding SystemSettings table..."
sqlite3 prisma/dev.db < add-system-settings.sql
echo "✅ Table created"
echo ""

# Step 2: Generate Prisma Client
echo "🔨 Step 2/4: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Step 3: Clear cache
echo "🧹 Step 3/4: Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

# Step 4: Verify table
echo "📋 Step 4/4: Verifying SystemSettings table..."
sqlite3 prisma/dev.db "SELECT * FROM SystemSettings;" || echo "No data yet (OK)"
echo ""

echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "Now run:"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000/admin"
echo "Look for '⚡ Cập nhật tự động' section with 'Thay đổi' button"

