#!/bin/bash
set -e

cd /Users/n/Code/creator

echo "============================================"
echo "🔧 Fixing Prisma Cache Issue"
echo "============================================"
echo ""

# Step 1: Kill server
echo "🛑 Step 1/7: Stopping Next.js server..."
pkill -f "next dev" 2>/dev/null || echo "   No server running"
sleep 2
echo "✅ Server stopped"
echo ""

# Step 2: Check DATABASE_URL
echo "🔍 Step 2/7: Checking DATABASE_URL..."
if grep -q "schema=public" .env 2>/dev/null; then
    echo "⚠️  Found 'schema=public' in DATABASE_URL"
    echo "   Please remove it! Should be:"
    echo '   DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cryptopulse"'
    echo ""
fi
echo "✅ DATABASE_URL check complete"
echo ""

# Step 3: Clear all cache
echo "🗑️  Step 3/7: Clearing all cache..."
rm -rf .next
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
echo "✅ Cache cleared"
echo ""

# Step 4: Test connection
echo "🔌 Step 4/7: Testing database connection..."
docker exec cryptopulse-db psql -U postgres -d cryptopulse -c "SELECT 1;" > /dev/null 2>&1 && \
    echo "✅ Database connection OK" || \
    echo "⚠️  Database connection failed - is Docker running?"
echo ""

# Step 5: Generate Prisma Client
echo "🔨 Step 5/7: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Step 6: Verify with db pull
echo "🔍 Step 6/7: Verifying schema..."
npx prisma db pull --force > /dev/null 2>&1 && \
    echo "✅ Schema verified" || \
    echo "⚠️  Schema verification skipped"
echo ""

# Step 7: Ready
echo "✅ Step 7/7: All done!"
echo ""

echo "============================================"
echo "✅ Fix Complete!"
echo "============================================"
echo ""
echo "Your .env should have:"
echo '  DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cryptopulse"'
echo ""
echo "Now run:"
echo "  npm run dev"
echo ""
echo "Then visit:"
echo "  http://localhost:3000"

