#!/bin/bash
set -e

cd /Users/n/Code/creator

echo "============================================"
echo "🐳 PostgreSQL Docker Setup"
echo "============================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo ""
    echo "Please install Docker Desktop:"
    echo "  https://www.docker.com/products/docker-desktop"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    echo ""
    exit 1
fi

echo "✅ Docker is ready"
echo ""

# Step 1: Start PostgreSQL container
echo "🐳 Step 1/7: Starting PostgreSQL container..."
docker-compose up -d
echo "✅ PostgreSQL container started"
echo ""

# Step 2: Wait for PostgreSQL to be ready
echo "⏳ Step 2/7: Waiting for PostgreSQL to be ready..."
sleep 5
until docker exec cryptopulse-db pg_isready -U postgres &> /dev/null; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready"
echo ""

# Step 3: Update .env
echo "📝 Step 3/7: Checking .env file..."
if ! grep -q "DATABASE_URL.*postgresql.*localhost:5432" .env 2>/dev/null; then
    echo "⚠️  Please update your .env file with:"
    echo ""
    echo 'DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cryptopulse?schema=public"'
    echo ""
    echo "Template available in: env-docker-template.txt"
    echo ""
    read -p "Press Enter after updating .env..."
fi
echo "✅ .env configured"
echo ""

# Step 4: Clean up old files
echo "🧹 Step 4/7: Cleaning up old files..."
rm -f prisma/dev.db
rm -f prisma/dev.db-journal
rm -rf prisma/migrations
rm -rf .next
echo "✅ Cleanup complete"
echo ""

# Step 5: Run migrations
echo "📦 Step 5/7: Running migrations..."
npx prisma migrate dev --name init
echo "✅ Migrations complete"
echo ""

# Step 6: Generate Prisma Client
echo "🔨 Step 6/7: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Step 7: Seed database
echo "🌱 Step 7/7: Seeding database..."
npm run seed
echo "✅ Database seeded"
echo ""

echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "PostgreSQL is running in Docker:"
echo "  🐳 Container: cryptopulse-db"
echo "  📍 Host: localhost:5432"
echo "  👤 User: postgres"
echo "  🔑 Password: postgres123"
echo "  💾 Database: cryptopulse"
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
echo "Useful commands:"
echo "  docker-compose up -d          # Start PostgreSQL"
echo "  docker-compose down           # Stop PostgreSQL"
echo "  docker-compose logs -f        # View logs"
echo "  npx prisma studio             # Open database UI"
echo "  docker exec -it cryptopulse-db psql -U postgres cryptopulse"
echo "                                # Connect to PostgreSQL CLI"

