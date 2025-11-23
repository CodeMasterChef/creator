# Database Migration Guide: SQLite → PostgreSQL

## Overview
This guide helps you migrate from local SQLite to production PostgreSQL on Vercel.

## Pre-Migration Steps

### 1. Backup Current Data (Optional for Local Dev)
If you want to preserve your local development data:

```bash
# Export current data using Prisma
npx prisma db pull
npx tsx view_db.ts > backup_articles.txt
```

### 2. Update Environment Variables

**Local Development (.env.local):**
```bash
# Keep SQLite for local development
DATABASE_URL="file:./prisma/dev.db"
```

**Production (Vercel):**
```bash
# Use Vercel Postgres connection string
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

## Migration Steps for Production

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel project
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a region (recommend: Singapore for Asia)
6. Click **Create**

### Step 2: Get Connection Strings

After creating the database:
1. Click on your database
2. Go to **.env.local** tab
3. Copy both connection strings:
   - `POSTGRES_URL` → use as `DATABASE_URL`
   - `POSTGRES_URL_NON_POOLING` → use as `DIRECT_URL`

### Step 3: Set Environment Variables in Vercel

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:
   ```
   DATABASE_URL=<POSTGRES_URL from step 2>
   DIRECT_URL=<POSTGRES_URL_NON_POOLING from step 2>
   AUTH_SECRET=<generate with: openssl rand -base64 32>
   AUTH_TRUST_HOST=true
   NEXTAUTH_URL=https://your-app.vercel.app
   GEMINI_API_KEY=<your_key>
   ```

### Step 4: Generate and Push Migration

From your local development:

```bash
# Generate migration for PostgreSQL
npx prisma migrate dev --name init_postgres

# This creates migration files in prisma/migrations/
```

### Step 5: Deploy to Vercel

```bash
# Commit your changes
git add .
git commit -m "feat: migrate to PostgreSQL for production"
git push origin main
```

Vercel will automatically:
1. Run `prisma generate`
2. Run `prisma migrate deploy`
3. Build and deploy your app

### Step 6: Create Initial Admin User

After successful deployment, create your admin user:

**Option A: Using Prisma Studio**
```bash
# Connect to production database
npx prisma studio --url="your_postgres_url"
```

**Option B: Using a seed script**
Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('your_secure_password', 10);
    
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Admin',
            role: 'admin'
        }
    });
    
    console.log('✅ Admin user created');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
```

Then run:
```bash
DATABASE_URL="your_production_url" npx tsx prisma/seed.ts
```

## Troubleshooting

### Issue: Migration fails on Vercel

**Solution:** Check Vercel build logs. Common issues:
- Wrong `DATABASE_URL` format
- Missing `DIRECT_URL` (required for Vercel Postgres)
- Firewall blocking connection

### Issue: "Prepared statement already exists"

**Solution:** This happens with connection pooling. Make sure you're using:
- `DATABASE_URL` for general queries (pooled)
- `DIRECT_URL` for migrations (direct connection)

### Issue: Can't connect to database locally

**Solution:** 
- For local dev, keep using SQLite: `DATABASE_URL="file:./prisma/dev.db"`
- Only use PostgreSQL URL for production

## Post-Migration Checklist

- [ ] Verify app builds successfully on Vercel
- [ ] Admin login works
- [ ] Can create articles
- [ ] Can view articles on public site
- [ ] Auto-generation cron job works
- [ ] All API endpoints functioning

## Rollback Plan

If migration fails, you can quickly rollback:

1. Revert schema.prisma to SQLite:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Push to Vercel:
```bash
git revert HEAD
git push origin main
```

## Notes

- **Development:** Continue using SQLite locally
- **Production:** PostgreSQL on Vercel
- **Schema changes:** Always test locally first, then deploy
- **Backups:** Vercel Postgres includes automatic daily backups


