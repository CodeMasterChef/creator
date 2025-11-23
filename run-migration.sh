#!/bin/bash
cd /Users/n/Code/creator
echo "🛑 Stopping server..."
pkill -f "next dev"
sleep 2
echo "📦 Running migration..."
npx prisma migrate dev --name add_system_settings
echo "🔨 Generating Prisma Client..."
npx prisma generate
echo "✅ Done! Now run: npm run dev"

