# 🐘 Cài Đặt PostgreSQL

## 📋 Yêu Cầu

Bạn cần có:
- PostgreSQL đã cài đặt (local hoặc cloud: Supabase, Neon, Railway, etc.)
- Connection string (DATABASE_URL)

---

## 🔧 Bước 1: Cấu Hình Environment Variables

Thêm vào file `.env`:

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Ví dụ Local:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/cryptopulse?schema=public"

# Ví dụ Supabase:
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Ví dụ Neon:
# DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## 🚀 Bước 2: Chạy Migration

```bash
cd /Users/n/Code/creator

# Xóa cache cũ
rm -rf .next

# Xóa SQLite database cũ (nếu có)
rm -rf prisma/dev.db
rm -rf prisma/migrations

# Chạy migration cho PostgreSQL
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

## 🌱 Bước 3: Seed Database (Tùy chọn)

```bash
# Seed dữ liệu mẫu
npm run seed
```

---

## ▶️ Bước 4: Start Server

```bash
npm run dev
```

---

## 🗄️ Cấu Trúc Database

Schema sẽ tự động tạo các bảng:

1. **User** - Tài khoản admin
2. **Article** - Bài viết
3. **GenerationLog** - Lịch sử tạo bài tự động
4. **SystemSettings** - Cài đặt hệ thống (interval, etc.)

---

## 🐛 Troubleshooting

### Lỗi: "the URL must start with postgresql://"
- Kiểm tra `DATABASE_URL` trong `.env`
- Format phải là: `postgresql://user:pass@host:port/db`

### Lỗi: "Can't reach database server"
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra host, port, username, password
- Kiểm tra firewall/network access

### Lỗi: "relation does not exist"
- Chạy lại: `npx prisma migrate dev`
- Hoặc: `npx prisma db push` (force sync)

---

## 📱 PostgreSQL Cloud Services

### 🟢 Supabase (Miễn phí, Khuyên dùng)
1. Tạo project: https://supabase.com
2. Vào Settings → Database → Connection string
3. Copy "Connection pooling" URL
4. Paste vào `.env` as `DATABASE_URL`

### 🔵 Neon (Miễn phí, Serverless)
1. Tạo project: https://neon.tech
2. Copy connection string
3. Paste vào `.env`

### 🟣 Railway (Miễn phí $5/tháng)
1. Deploy PostgreSQL: https://railway.app
2. Copy DATABASE_URL từ Variables
3. Paste vào `.env`

---

## ✅ Kiểm Tra Kết Nối

```bash
# Test connection
npx prisma db pull

# Open Prisma Studio
npx prisma studio
```

---

## 🎉 Hoàn Thành!

Sau khi setup xong, tính năng **Interval Settings** sẽ hoạt động:
- Vào `/admin`
- Tìm "⚡ Cập nhật tự động"
- Click "Thay đổi" để cài đặt interval mới!

---

## 💾 Migrate từ SQLite sang PostgreSQL

Nếu bạn đã có dữ liệu trong SQLite:

```bash
# 1. Export data từ SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# 2. Setup PostgreSQL như hướng dẫn trên

# 3. Import thủ công hoặc re-seed
npm run seed
```

