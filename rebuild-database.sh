#!/bin/bash
set -e

cd /Users/n/Code/creator

echo "============================================"
echo "🔧 Rebuilding SQLite Database"
echo "============================================"
echo ""

# Step 1: Backup old database
echo "💾 Step 1/6: Backing up old database..."
if [ -f prisma/dev.db ]; then
    cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d-%H%M%S)
    echo "✅ Backup created"
else
    echo "⚠️  No existing database found"
fi
echo ""

# Step 2: Delete old database and migrations
echo "🗑️  Step 2/6: Cleaning up..."
rm -f prisma/dev.db
rm -f prisma/dev.db-journal
rm -rf prisma/migrations
echo "✅ Cleanup complete"
echo ""

# Step 3: Create fresh migration
echo "📦 Step 3/6: Creating fresh migrations..."
npx prisma migrate dev --name init
echo "✅ Migrations created"
echo ""

# Step 4: Generate Prisma Client
echo "🔨 Step 4/6: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Step 5: Seed database
echo "🌱 Step 5/6: Seeding database..."
npm run seed
echo "✅ Database seeded"
echo ""

# Step 6: Clear Next.js cache
echo "🧹 Step 6/6: Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

echo "============================================"
echo "✅ Database Rebuild Complete!"
echo "============================================"
echo ""
echo "Database includes:"
echo "  ✅ User table"
echo "  ✅ Article table"
echo "  ✅ GenerationLog table"
echo "  ✅ SystemSettings table"
echo ""
echo "Now run:"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000/admin"
echo "  Default login: admin@example.com / admin123"

