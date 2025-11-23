# Environment Variables Setup Guide

## Required Environment Variables

### Development (.env.local)
```bash
# Database - For local development, use SQLite
DATABASE_URL="file:./prisma/dev.db"

# NextAuth Configuration
AUTH_SECRET="your-secret-generated-with-openssl"
AUTH_TRUST_HOST="true"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key_here"
```

### Production (Vercel Environment Variables)
```bash
# Database - Vercel Postgres connection string
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# NextAuth Configuration
AUTH_SECRET="generate_new_secret_for_production"
AUTH_TRUST_HOST="true"
NEXTAUTH_URL="https://your-app.vercel.app"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key_here"
```

## How to Generate AUTH_SECRET

### Option 1: Using OpenSSL (Recommended)
```bash
openssl rand -base64 32
```

### Option 2: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Option 3: Online Generator
Visit: https://generate-secret.vercel.app/32

## Setup Steps

### Local Development
1. Copy `.env.local.example` to `.env.local`
2. Generate `AUTH_SECRET` using one of the methods above
3. Add your `GEMINI_API_KEY` from Google AI Studio
4. Keep `DATABASE_URL` as SQLite for local development

### Production (Vercel)
1. Go to Vercel Project Settings > Environment Variables
2. Add all required variables listed above
3. Use Vercel Postgres connection string for `DATABASE_URL`
4. Generate a NEW `AUTH_SECRET` (never reuse development secret)
5. Set `NEXTAUTH_URL` to your production URL

## Security Notes

- **NEVER** commit `.env.local` or `.env` to Git
- Use different `AUTH_SECRET` for development and production
- Store secrets securely (use password manager)
- Rotate `AUTH_SECRET` periodically in production
- Use Vercel's encrypted environment variables feature


