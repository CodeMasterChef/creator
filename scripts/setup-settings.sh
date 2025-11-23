#!/bin/bash

echo "🔧 Setting up SystemSettings table..."

cd "$(dirname "$0")/.."

# Run Prisma migration
echo "📦 Creating migration..."
npx prisma migrate dev --name add_system_settings

# Generate Prisma Client
echo "🔨 Regenerating Prisma Client..."
npx prisma generate

echo "✅ Setup complete! SystemSettings table is ready."
echo ""
echo "💡 The system will now read generation interval from the database."
echo "💡 Default interval: 120 minutes (2 hours)"
echo "💡 You can change this from the Admin dashboard."

