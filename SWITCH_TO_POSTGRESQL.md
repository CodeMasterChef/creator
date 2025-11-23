# 🐘 Chuyển Sang PostgreSQL

## 📋 Bước 1: Setup PostgreSQL Database

### Option A: Supabase (Miễn phí, Khuyên dùng)

1. Truy cập: https://supabase.com
2. Đăng ký/Đăng nhập
3. Click "New Project"
4. Điền thông tin:
   - **Name**: cryptopulse (hoặc tên bạn muốn)
   - **Database Password**: [tạo password mạnh]
   - **Region**: chọn gần bạn nhất
5. Đợi ~2 phút để project được tạo
6. Vào **Settings** → **Database**
7. Tìm phần **Connection string** → Tab **Connection pooling**
8. Copy URL (dạng: `postgresql://postgres.[ref]:[YOUR-PASSWORD]@...`)

### Option B: Neon (Miễn phí, Serverless)

1. Truy cập: https://neon.tech
2. Đăng ký và tạo project
3. Copy connection string từ dashboard

### Option C: Railway (Free $5/month)

1. Truy cập: https://railway.app
2. Deploy PostgreSQL
3. Copy DATABASE_URL từ Variables

### Option D: Local PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Tạo database
createdb cryptopulse

# Connection string:
# postgresql://username:password@localhost:5432/cryptopulse
```

---

## 🔧 Bước 2: Cập Nhật .env

Mở file `.env` và thay đổi:

```env
# Xóa dòng SQLite cũ:
# DATABASE_URL="file:./dev.db"

# Thêm PostgreSQL connection string:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres"

# Ví dụ Supabase:
DATABASE_URL="postgresql://postgres.abcdefghijk:your_password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Ví dụ Neon:
DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Ví dụ Local:
DATABASE_URL="postgresql://postgres:password@localhost:5432/cryptopulse"
```

⚠️ **LƯU Ý**: Thay `[YOUR-PASSWORD]` và `[YOUR-REF]` bằng giá trị thực tế!

---

## 🚀 Bước 3: Chạy Migration

```bash
cd /Users/n/Code/creator

# 1. Xóa SQLite database cũ
rm -f prisma/dev.db
rm -f prisma/dev.db-journal

# 2. Xóa migrations cũ (SQLite)
rm -rf prisma/migrations

# 3. Xóa cache
rm -rf .next
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# 4. Chạy migration mới cho PostgreSQL
npx prisma migrate dev --name init

# 5. Generate Prisma Client
npx prisma generate

# 6. Seed database
npm run seed
```

---

## ✅ Bước 4: Verify

```bash
# Kiểm tra connection
npx prisma db pull

# Xem database trong UI
npx prisma studio
```

---

## 🎯 Bước 5: Start Server

```bash
npm run dev
```

Truy cập: http://localhost:3000/admin

---

## 🗄️ Database Schema

PostgreSQL sẽ tự động tạo các bảng:

1. **User** - Admin accounts
2. **Article** - Bài viết (với slug, tags)
3. **GenerationLog** - Lịch sử tạo bài tự động
4. **SystemSettings** - Cài đặt interval

---

## 🎉 Tính Năng Interval Settings

Sau khi setup xong, vào Admin Dashboard:

1. Tìm phần **"⚡ Cập nhật tự động"**
2. Click **"Thay đổi"**
3. Nhập số và chọn đơn vị (Phút/Giờ)
4. Click **"Lưu cài đặt"**
5. ✅ Scheduler tự động restart!

---

## 🐛 Troubleshooting

### Lỗi: "Can't reach database server"
- Kiểm tra DATABASE_URL đúng format
- Kiểm tra password không có ký tự đặc biệt cần encode
- Kiểm tra firewall/network

### Lỗi: "SSL connection required"
- Thêm `?sslmode=require` vào cuối DATABASE_URL

### Lỗi: "Password authentication failed"
- Kiểm tra lại password trong connection string
- Password có ký tự đặc biệt cần encode (dùng encodeURIComponent)

### Lỗi: "relation does not exist"
- Chạy lại: `npx prisma migrate dev --name init`
- Hoặc: `npx prisma db push` (force sync)

---

## 💡 Tips

### Encode Password Với Ký Tự Đặc Biệt

Nếu password có ký tự đặc biệt như `@`, `#`, `$`, `%`:

```javascript
// Node.js console:
const password = "myP@ssw0rd!";
console.log(encodeURIComponent(password));
// Output: myP%40ssw0rd%21
```

Dùng password đã encode trong DATABASE_URL.

### Connection Pooling (Supabase)

Supabase cung cấp 2 loại connection string:

- **Transaction Mode** (Direct): Dùng cho migrations
- **Session Mode** (Pooler): Dùng cho app

Khuyên dùng **Pooler** cho development và production.

---

## 📊 So Sánh SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Setup | ✅ Đơn giản | ⚠️ Cần server |
| Performance | ✅ Tốt (small scale) | 🚀 Tốt hơn (large scale) |
| Concurrent Writes | ⚠️ Hạn chế | ✅ Xuất sắc |
| Production Ready | ⚠️ Không khuyên | ✅ Khuyên dùng |
| Backup | File copy | pg_dump / Supabase backup |
| Full-text Search | Basic | Advanced |
| JSON Support | Basic | Advanced |

---

## ✅ Checklist

- [ ] Tạo PostgreSQL database (Supabase/Neon/Railway/Local)
- [ ] Copy connection string
- [ ] Update `DATABASE_URL` in `.env`
- [ ] Xóa SQLite files và migrations cũ
- [ ] Chạy `npx prisma migrate dev --name init`
- [ ] Chạy `npx prisma generate`
- [ ] Chạy `npm run seed`
- [ ] Start server: `npm run dev`
- [ ] Test tính năng Interval Settings

---

🎉 **Done!** Bây giờ bạn đã chuyển sang PostgreSQL thành công!

