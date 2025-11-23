# 🚀 Cloud PostgreSQL Setup (Recommended)

Due to the persistent Docker PostgreSQL connection issues, I recommend using a free cloud PostgreSQL service.

## Option 1: Supabase (Recommended - Free & Easy)

### Steps:

1. **Create Account**: Go to https://supabase.com and sign up
2. **Create Project**: 
   - Click "New Project"
   - Choose a name (e.g., "cryptopulse")
   - Set a strong database password
   - Choose a region close to you
   - Wait 1-2 minutes for project creation

3. **Get Connection String**:
   - Go to Project Settings → Database
   - Scroll to "Connection string"
   - Click "URI" tab
   - Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

4. **Update .env**:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres?schema=public&pgbouncer=true&connection_limit=1"
```

5. **Run Setup**:
```bash
cd /Users/n/Code/creator
rm -rf .next node_modules/.prisma
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## Option 2: Neon (Free & Serverless)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string
4. Update `.env` with the connection string
5. Run the same setup commands as above

## Option 3: Railway (Free tier available)

1. Go to https://railway.app and sign up
2. Create a new PostgreSQL service
3. Copy the DATABASE_URL from the Variables tab
4. Update `.env` and run setup

## Why Cloud Database?

- ✅ No Docker configuration issues
- ✅ Automatic backups
- ✅ Better performance
- ✅ Free tier available
- ✅ Works perfectly with Prisma
- ✅ Can be accessed from anywhere
- ✅ Production-ready

## Troubleshooting

If you still want to use Docker PostgreSQL, the issue appears to be related to:
- Prisma 5.22.0 on macOS ARM64
- Docker network configuration
- Query engine connection pooling

You can try:
1. Upgrading to Prisma 7.0+
2. Using a different Docker image
3. Checking macOS security settings for Docker


