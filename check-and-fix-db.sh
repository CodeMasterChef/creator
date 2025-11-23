#!/bin/bash
set -e

cd /Users/n/Code/creator

echo "============================================"
echo "🔍 Checking Database Status"
echo "============================================"
echo ""

# Check if Docker is running
echo "📦 Checking Docker container..."
if docker ps | grep -q cryptopulse-db; then
    echo "✅ Docker container is running"
else
    echo "❌ Docker container not running!"
    echo "   Starting container..."
    docker compose up -d
    sleep 5
fi
echo ""

# Check database exists
echo "🗄️  Checking database..."
docker exec cryptopulse-db psql -U postgres -lqt | cut -d \| -f 1 | grep -qw cryptopulse && \
    echo "✅ Database 'cryptopulse' exists" || \
    echo "❌ Database 'cryptopulse' NOT found!"
echo ""

# Check tables
echo "📋 Checking tables..."
TABLES=$(docker exec cryptopulse-db psql -U postgres -d cryptopulse -c "\dt" 2>&1)

if echo "$TABLES" | grep -q "Did not find any relations"; then
    echo "❌ NO TABLES FOUND! Database is empty."
    echo ""
    echo "🔧 Running migration to create tables..."
    npx prisma migrate dev --name init
    echo ""
    echo "🌱 Seeding database..."
    npm run seed
    echo ""
    echo "✅ Database setup complete!"
else
    echo "✅ Tables found:"
    docker exec cryptopulse-db psql -U postgres -d cryptopulse -c "\dt" | grep "public |"
fi
echo ""

echo "============================================"
echo "✅ Check Complete!"
echo "============================================"
echo ""
echo "Now run:"
echo "  npm run dev"

