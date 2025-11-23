#!/bin/bash

# 🔄 Script Restart Dev Server
# Kill port 3000 và chạy lại Next.js

echo "🔍 Checking for processes on port 3000..."

# Tìm process đang dùng port 3000
PID=$(lsof -ti:3000)

if [ -z "$PID" ]; then
    echo "✅ Port 3000 is free"
else
    echo "🔪 Killing process on port 3000 (PID: $PID)..."
    kill -9 $PID
    sleep 1
    echo "✅ Process killed"
fi

echo "🚀 Starting Next.js dev server..."
echo ""

# Start dev server
npm run dev

