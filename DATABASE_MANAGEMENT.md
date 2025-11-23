# 🗄️ Hướng Dẫn Quản Lý Database

## Tổng Quan

Dự án sử dụng:
- **Development**: SQLite (`prisma/dev.db`)
- **Production**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma

---

## 📊 Cách 1: Prisma Studio (Recommended - Giao Diện Đẹp)

### Local Development

```bash
# Mở Prisma Studio cho local database
npm run db:studio

# Hoặc
npx prisma studio
```

Prisma Studio sẽ mở tại: `http://localhost:5555`

### Production Database

```bash
# Connect đến production database
npx prisma studio --url="YOUR_POSTGRES_URL"
```

**Lấy URL từ đâu?**
- Vào Vercel Dashboard
- Storage → Your Database → .env.local
- Copy `POSTGRES_URL`

### Tính Năng Prisma Studio

- ✅ Xem tất cả tables
- ✅ Browse, filter, sort data
- ✅ Thêm, sửa, xóa records
- ✅ Xem relationships
- ✅ Export data
- ✅ Giao diện đẹp, dễ dùng

**Screenshot chức năng:**
- View records: Click vào table name (User, Article)
- Add record: Click nút "Add record"
- Edit record: Click vào row → Edit
- Delete: Click vào row → Delete

---

## 📋 Cách 2: Script View Database (Em Đã Tạo Sẵn)

### Xem Nhanh Trong Terminal

```bash
# Xem toàn bộ database với highlight bài trùng
npx tsx view_db.ts
```

**Output sẽ hiển thị:**
```
📊 DATABASE OVERVIEW

Total Articles: 12

⚠️  DUPLICATE IMAGES DETECTED

Found 3 duplicate images affecting 6 articles:

📷 Image: https://cdn.sanity.io/...
   Used by 2 articles: cmibicojl0002e1k8ebsbqf2u, cmibh5llv0001xnikv6e0065c

...

📰 ALL ARTICLES:
====================================================================================================

🔴 DUPLICATE 1. [Title của bài trùng] (highlighted màu đỏ/vàng)
   ID: xxx
   Slug: xxx
   ...
```

**Features:**
- ✅ Tổng quan database
- ✅ Phát hiện bài trùng (highlight màu)
- ✅ Hiển thị đầy đủ metadata
- ✅ Dễ đọc trong terminal

### Tùy Chỉnh Script

Nếu muốn export ra file:
```bash
npx tsx view_db.ts > database_backup_$(date +%Y%m%d).txt
```

Nếu muốn xem production:
```bash
# Set DATABASE_URL trước
DATABASE_URL="your_postgres_url" npx tsx view_db.ts
```

---

## 🔧 Cách 3: Prisma CLI Commands

### Xem Schema/Structure

```bash
# Xem current schema
npx prisma db pull

# Generate diagram (cần prisma-erd-generator)
npx prisma generate
```

### Query Trực Tiếp

```bash
# Mở Prisma console (experimental)
npx prisma db execute --stdin

# Rồi gõ SQL:
SELECT * FROM "Article" LIMIT 10;
```

---

## 🐘 Cách 4: PostgreSQL Tools (Production Only)

### A. pgAdmin (GUI - Chuyên Nghiệp)

1. Download: https://www.pgadmin.org/download/
2. Install
3. Add connection:
   - Host: Lấy từ Vercel Postgres URL
   - Port: 5432
   - Database: từ URL
   - Username: từ URL
   - Password: từ URL

### B. psql (Command Line)

```bash
# Connect trực tiếp
psql "postgresql://user:password@host:5432/database?sslmode=require"

# Hoặc nếu đã có POSTGRES_URL
psql $POSTGRES_URL
```

**Common Commands:**
```sql
-- List all tables
\dt

-- Describe table
\d "Article"

-- View all articles
SELECT id, title, "isPublished", "createdAt" FROM "Article" ORDER BY "createdAt" DESC;

-- Count articles
SELECT COUNT(*) FROM "Article";

-- Find duplicates
SELECT image, COUNT(*) as count 
FROM "Article" 
GROUP BY image 
HAVING COUNT(*) > 1;

-- Exit
\q
```

### C. TablePlus (GUI - Đẹp Nhất)

1. Download: https://tableplus.com/
2. New Connection → PostgreSQL
3. Paste connection string từ Vercel
4. Connect!

**Pros:**
- Giao diện đẹp nhất
- Multi-database support
- SQL editor với syntax highlighting
- Export data dễ dàng

---

## 📈 Cách 5: Vercel Dashboard (Web-based)

1. Vào Vercel Dashboard
2. Project → Storage → Your Database
3. Tab **Data**
4. Browse tables trực tiếp trong browser

**Pros:**
- Không cần install gì
- Truy cập mọi lúc mọi nơi
- Tích hợp với Vercel

**Cons:**
- Tính năng hạn chế hơn Prisma Studio
- Không có advanced filtering

---

## 🔍 Use Cases & Best Practices

### Khi Nào Dùng Tool Nào?

#### Prisma Studio
- ✅ View và edit data thường xuyên
- ✅ Development workflow
- ✅ Quick data fixes
- ✅ Non-technical users

#### view_db.ts Script
- ✅ Quick overview
- ✅ Check for duplicates
- ✅ Debugging
- ✅ CI/CD reports

#### psql / SQL Clients
- ✅ Complex queries
- ✅ Bulk operations
- ✅ Performance analysis
- ✅ Database administration

#### Vercel Dashboard
- ✅ Quick checks on mobile
- ✅ Monitor storage usage
- ✅ Access from anywhere

---

## 🛠️ Common Database Tasks

### 1. Xem Tất Cả Bài Viết

**Prisma Studio:**
```
1. npm run db:studio
2. Click "Article" trong sidebar
3. Scroll hoặc filter
```

**Script:**
```bash
npx tsx view_db.ts
```

**SQL:**
```sql
SELECT * FROM "Article" ORDER BY "createdAt" DESC LIMIT 20;
```

### 2. Tìm Bài Trùng Lặp

**Script (Best):**
```bash
npx tsx view_db.ts
# Tự động highlight bài trùng
```

**SQL:**
```sql
SELECT 
  image, 
  COUNT(*) as count,
  STRING_AGG(id, ', ') as article_ids
FROM "Article" 
GROUP BY image 
HAVING COUNT(*) > 1;
```

### 3. Xóa Bài Trùng

**Prisma Studio:**
```
1. Mở Article table
2. Filter by image URL
3. Select và delete các bài không cần
```

**SQL (Careful!):**
```sql
-- Xem trước
SELECT * FROM "Article" WHERE image = 'duplicate_image_url';

-- Xóa (giữ lại 1 bài mới nhất)
DELETE FROM "Article" 
WHERE id IN (
  SELECT id FROM "Article" 
  WHERE image = 'duplicate_image_url'
  ORDER BY "createdAt" DESC
  OFFSET 1
);
```

### 4. Backup Database

**Export All Data:**
```bash
# Development (SQLite)
cp prisma/dev.db prisma/dev.db.backup

# Production (PostgreSQL)
pg_dump $POSTGRES_URL > backup_$(date +%Y%m%d).sql

# Hoặc dùng script
npx tsx view_db.ts > backup.txt
```

**Vercel Backup:**
- Vercel Postgres có auto-backup hàng ngày
- Storage → Database → Backups tab

### 5. Restore Database

**From SQL dump:**
```bash
psql $POSTGRES_URL < backup.sql
```

**From Vercel backup:**
- Storage → Backups → Click backup → Restore

### 6. Tạo Admin User

**Option A: Seed Script (Easiest)**
```bash
npm run db:seed
```

**Option B: Prisma Studio**
```
1. Mở Prisma Studio
2. Click "User" table
3. Add record:
   - email: admin@example.com
   - password: [hashed - dùng bcrypt online]
   - name: Admin
   - role: admin
```

**Option C: SQL**
```sql
-- Generate password hash tại: https://bcrypt-generator.com/
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  '$2a$10$hashedpassword...',
  'Admin',
  'admin',
  NOW(),
  NOW()
);
```

### 7. Update Bài Viết

**Prisma Studio:**
```
1. Mở Article table
2. Click vào row muốn edit
3. Edit fields
4. Save
```

**SQL:**
```sql
UPDATE "Article" 
SET 
  title = 'New Title',
  content = 'New Content',
  "updatedAt" = NOW()
WHERE id = 'article_id';
```

### 8. Statistics Queries

**Count by status:**
```sql
SELECT 
  "isPublished",
  COUNT(*) as count
FROM "Article"
GROUP BY "isPublished";
```

**Articles per day:**
```sql
SELECT 
  DATE("createdAt") as date,
  COUNT(*) as articles
FROM "Article"
GROUP BY DATE("createdAt")
ORDER BY date DESC
LIMIT 7;
```

**Top sources:**
```sql
SELECT 
  source,
  COUNT(*) as count
FROM "Article"
WHERE source IS NOT NULL
GROUP BY source
ORDER BY count DESC;
```

---

## 🔐 Security Best Practices

### Development
```bash
# Local SQLite - OK to access directly
npm run db:studio
```

### Production
```bash
# NEVER commit production DATABASE_URL
# Use environment variable
export POSTGRES_URL="postgresql://..."
npx prisma studio --url="$POSTGRES_URL"

# Or use .env.local (gitignored)
echo "POSTGRES_URL=your_url" >> .env.local
npm run db:studio
```

### Read-Only Access

Nếu chỉ muốn xem, không edit:
```bash
# Vercel Dashboard (safe - read only UI)
# hoặc dùng script
npx tsx view_db.ts
```

---

## 🚨 Troubleshooting

### Error: "Can't reach database server"

**Solution:**
```bash
# 1. Check DATABASE_URL
echo $DATABASE_URL

# 2. Verify connection
npx prisma db pull

# 3. Check if database is running (Vercel)
# Vào Vercel Dashboard → Storage → Check status
```

### Error: "Table does not exist"

**Solution:**
```bash
# Run migrations
npx prisma migrate dev    # Development
npx prisma migrate deploy # Production
```

### Error: "Permission denied"

**Solution:**
- Check DATABASE_URL has correct credentials
- For Vercel Postgres, use POSTGRES_URL (pooled) not DIRECT_URL

### Prisma Studio stuck/slow

**Solution:**
```bash
# Kill process
pkill -9 prisma

# Clear cache
rm -rf node_modules/.prisma

# Regenerate
npx prisma generate

# Restart
npm run db:studio
```

---

## 📚 Useful Resources

- [Prisma Studio Docs](https://www.prisma.io/docs/concepts/components/prisma-studio)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [pgAdmin](https://www.pgadmin.org/)
- [TablePlus](https://tableplus.com/)
- [Vercel Storage](https://vercel.com/docs/storage/vercel-postgres)

---

## 💡 Tips & Tricks

### 1. Quick Checks
```bash
# Count all records
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Article\";"

# Latest 5 articles
npx tsx -e "
import { prisma } from './src/lib/prisma.ts';
const articles = await prisma.article.findMany({take: 5, orderBy: {createdAt: 'desc'}});
console.log(articles.map(a => a.title));
"
```

### 2. Mass Operations
```bash
# Delete all drafts
npx prisma db execute --stdin <<< "DELETE FROM \"Article\" WHERE \"isPublished\" = false;"

# Publish all articles
npx prisma db execute --stdin <<< "UPDATE \"Article\" SET \"isPublished\" = true;"
```

### 3. Database Performance
```sql
-- Find slow queries (PostgreSQL)
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text))
FROM pg_tables
WHERE schemaname = 'public';
```

---

## 🎯 Quick Reference

| Task | Tool | Command |
|------|------|---------|
| View data (GUI) | Prisma Studio | `npm run db:studio` |
| View data (CLI) | Custom Script | `npx tsx view_db.ts` |
| View production | Prisma Studio | `npx prisma studio --url="$POSTGRES_URL"` |
| Find duplicates | Custom Script | `npx tsx view_db.ts` |
| Backup | pg_dump | `pg_dump $POSTGRES_URL > backup.sql` |
| Create user | Seed | `npm run db:seed` |
| Run query | psql | `psql $POSTGRES_URL` |
| Migrations | Prisma | `npx prisma migrate dev` |

---

**Last Updated**: 2025-11-23  
**For Support**: Xem README.md hoặc DEPLOYMENT_GUIDE.md

