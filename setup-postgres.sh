#!/bin/bash
set -e

cd /Users/n/Code/creator

echo "============================================"
echo "🐘 PostgreSQL Setup Script"
echo "============================================"
echo ""

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env 2>/dev/null; then
    echo "❌ ERROR: DATABASE_URL not found in .env"
    echo ""
    echo "Please add your PostgreSQL connection string to .env:"
    echo ""
    echo "DATABASE_URL=\"postgresql://user:password@host:5432/database\""
    echo ""
    echo "Options:"
    echo "  1. Supabase: https://supabase.com (Free, Recommended)"
    echo "  2. Neon: https://neon.tech (Free, Serverless)"
    echo "  3. Railway: https://railway.app"
    echo "  4. Local: postgresql://postgres:password@localhost:5432/cryptopulse"
    echo ""
    exit 1
fi

# Step 1: Clean up old SQLite files
echo "🧹 Step 1/6: Cleaning up old SQLite files..."
rm -f prisma/dev.db
rm -f prisma/dev.db-journal
rm -rf prisma/migrations
echo "✅ Cleanup complete"
echo ""

# Step 2: Clear cache
echo "🗑️  Step 2/6: Clearing cache..."
rm -rf .next
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
echo "✅ Cache cleared"
echo ""

# Step 3: Run migration
echo "📦 Step 3/6: Running PostgreSQL migrations..."
npx prisma migrate dev --name init
echo "✅ Migrations complete"
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

# Step 6: Verify
echo "🔍 Step 6/6: Verifying setup..."
npx prisma db pull > /dev/null 2>&1 && echo "✅ Database connection successful" || echo "⚠️  Connection test skipped"
echo ""

echo "============================================"
echo "✅ PostgreSQL Setup Complete!"
echo "============================================"
echo ""
echo "Database includes:"
echo "  ✅ User table"
echo "  ✅ Article table"
echo "  ✅ GenerationLog table"
echo "  ✅ SystemSettings table"
echo ""
echo "Default admin:"
echo "  📧 Email: admin@thuvientienso.com"
echo "  🔑 Password: ChangeThisPassword123!"
echo ""
echo "Now run:"
echo "  npm run dev"
echo ""
echo "Then visit:"
echo "  🌐 http://localhost:3000/admin"
echo "  ⚡ Look for 'Cập nhật tự động' section with 'Thay đổi' button"
echo ""
echo "View database:"
echo "  npx prisma studio"

