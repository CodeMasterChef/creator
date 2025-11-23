# 🐛 Debug Checklist - Prisma Permission Error

## ❌ Lỗi Hiện Tại
```
User `postgres` was denied access on the database `cryptopulse.public`
```

## ✅ Checklist Để Fix

### 1. Kiểm Tra File `.env`

**Chạy lệnh:**
```bash
cd /Users/n/Code/creator
cat .env | grep DATABASE_URL
```

**Kết quả PHẢI là:**
```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cryptopulse"
```

**KHÔNG được có:**
- ❌ `?schema=public`
- ❌ `.public`
- ❌ Any query parameters về schema

**Nếu sai, sửa lại:**
```bash
# Backup
cp .env .env.backup

# Edit .env và thay đổi DATABASE_URL thành:
# DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cryptopulse"
```

---

### 2. Stop Server Hoàn Toàn

```bash
# Stop tất cả Next.js processes
pkill -9 -f "next dev"

# Verify không còn process nào
ps aux | grep "next dev"
```

---

### 3. Xóa Tất Cả Cache

```bash
cd /Users/n/Code/creator

# Xóa Next.js cache
rm -rf .next

# Xóa Prisma cache
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# Xóa Turbopack cache (quan trọng!)
rm -rf .turbo
rm -rf node_modules/.cache
```

---

### 4. Verify Docker Database

```bash
# Check Docker đang chạy
docker ps | grep cryptopulse-db

# Nếu không chạy, start:
docker compose up -d

# Test connection
docker exec cryptopulse-db psql -U postgres -d cryptopulse -c "\dt"

# Kết quả phải show các tables: Article, User, GenerationLog, SystemSettings
```

---

### 5. Generate Prisma Client Mới

```bash
cd /Users/n/Code/creator

# Force regenerate
npx prisma generate --force

# Verify
npx prisma validate
```

---

### 6. Test Connection Trực Tiếp

```bash
# Test Prisma connection
npx prisma studio

# Nếu Prisma Studio mở được (http://localhost:5555), nghĩa là connection OK
```

---

### 7. Start Server

```bash
npm run dev
```

---

## 🔍 Nếu Vẫn Lỗi, Debug Sâu Hơn

### Check 1: Prisma Client đang dùng URL nào?

```bash
# Xem generated Prisma Client
cat node_modules/.prisma/client/schema.prisma | head -n 10

# Phải thấy:
# datasource db {
#   provider = "postgresql"
#   url      = env("DATABASE_URL")
# }
```

### Check 2: .env có đang được load không?

Tạo file test:
```javascript
// test-env.js
require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
```

Chạy:
```bash
node test-env.js
```

Kết quả phải là:
```
DATABASE_URL: postgresql://postgres:postgres123@localhost:5432/cryptopulse
```

---

## 🎯 Solution Cuối Cùng (Nuclear Option)

Nếu tất cả đều fail, reset hoàn toàn:

```bash
cd /Users/n/Code/creator

# 1. Stop everything
pkill -9 -f "next dev"
docker compose down -v

# 2. Xóa tất cả
rm -rf .next node_modules/.prisma node_modules/@prisma .turbo

# 3. Fix .env (quan trọng!)
# Mở .env và đảm bảo:
# DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cryptopulse"

# 4. Start Docker
docker compose up -d
sleep 10

# 5. Setup database
npx prisma migrate dev --name init
npx prisma generate
npm run seed

# 6. Start server
npm run dev
```

---

## 📝 Common Mistakes

1. ❌ `.env` có `?schema=public` → Xóa đi
2. ❌ Server chưa được stop hẳn → `pkill -9`
3. ❌ Cache chưa được xóa hết → Xóa `.next`, `.turbo`, `node_modules/.prisma`
4. ❌ Docker container chưa chạy → `docker compose up -d`
5. ❌ Database chưa có tables → `npx prisma migrate dev`

---

## ✅ Success Indicators

Khi fix xong, bạn sẽ thấy:

1. Server start không lỗi
2. Homepage load được (http://localhost:3000)
3. Admin page load được (http://localhost:3000/admin)
4. Có thể login và thấy Interval Settings

---

## 🆘 Still Need Help?

Check log files:
```bash
# Next.js logs
cat .next/trace

# Docker logs
docker compose logs -f
```

Share output của:
```bash
cat .env | grep DATABASE_URL
docker ps
npx prisma validate
```

