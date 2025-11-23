# 🐳 PostgreSQL với Docker

## 📋 Yêu Cầu

- Docker Desktop đã cài đặt và đang chạy
- Download: https://www.docker.com/products/docker-desktop

---

## 🚀 Setup Nhanh (1 lệnh)

```bash
cd /Users/n/Code/creator
bash setup-docker.sh
```

Script sẽ tự động:
1. ✅ Start PostgreSQL container
2. ✅ Đợi database sẵn sàng
3. ✅ Xóa SQLite files cũ
4. ✅ Chạy migrations
5. ✅ Generate Prisma Client
6. ✅ Seed database
7. ✅ Sẵn sàng để chạy!

---

## 🔧 Setup Thủ Công

### Bước 1: Update .env

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cryptopulse?schema=public"
```

### Bước 2: Start PostgreSQL

```bash
# Start container
docker compose up -d

# Kiểm tra status
docker compose ps

# Xem logs
docker compose logs -f
```

### Bước 3: Setup Database

```bash
# Xóa SQLite cũ
rm -f prisma/dev.db
rm -rf prisma/migrations

# Run migration
npx prisma migrate dev --name init

# Generate Client
npx prisma generate

# Seed database
npm run seed
```

### Bước 4: Start Server

```bash
npm run dev
```

---

## 🗄️ Thông Tin Database

- **Host**: `localhost`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `postgres123`
- **Database**: `cryptopulse`

---

## 📊 Quản Lý Database

### Prisma Studio (Web UI)

```bash
npx prisma studio
```

Mở: http://localhost:5555

### PostgreSQL CLI

```bash
# Connect vào database
docker exec -it cryptopulse-db psql -U postgres cryptopulse

# List tables
\dt

# Query
SELECT * FROM "SystemSettings";

# Exit
\q
```

### pgAdmin (Optional)

Download: https://www.pgadmin.org/download/

Connection:
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres123`

---

## 🐳 Docker Commands

```bash
# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down

# Stop và xóa data
docker compose down -v

# Restart
docker compose restart

# View logs
docker compose logs -f postgres

# Check status
docker compose ps
```

---

## 🔄 Reset Database

```bash
# Stop container
docker compose down -v

# Start lại
docker compose up -d

# Wait for ready
sleep 5

# Setup lại
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

---

## 🎯 Interval Settings Feature

Sau khi setup xong:

1. Start server: `npm run dev`
2. Vào: http://localhost:3000/admin
3. Đăng nhập:
   - Email: `admin@thuvientienso.com`
   - Password: `ChangeThisPassword123!`
4. Tìm **"⚡ Cập nhật tự động"**
5. Click **"Thay đổi"**
6. Nhập số + chọn đơn vị (Phút/Giờ)
7. Click **"Lưu cài đặt"**
8. ✅ Done!

---

## 🐛 Troubleshooting

### Lỗi: "Docker is not running"

```bash
# macOS: Mở Docker Desktop app
open -a Docker
```

### Lỗi: "Port 5432 already in use"

```bash
# Kiểm tra process nào đang dùng port
lsof -i :5432

# Kill process (thay PID)
kill -9 [PID]

# Hoặc thay đổi port trong docker compose.yml
ports:
  - "5433:5432"  # Host:Container

# Update DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/cryptopulse"
```

### Lỗi: "Can't connect to database"

```bash
# Kiểm tra container đang chạy
docker compose ps

# Restart container
docker compose restart

# Xem logs
docker compose logs -f postgres
```

### Lỗi: "Password authentication failed"

```bash
# Stop và xóa data
docker compose down -v

# Start lại (sẽ tạo password mới)
docker compose up -d
```

---

## 💡 Tips

### Backup Database

```bash
# Export data
docker exec cryptopulse-db pg_dump -U postgres cryptopulse > backup.sql

# Restore data
docker exec -i cryptopulse-db psql -U postgres cryptopulse < backup.sql
```

### Change Password

Edit `docker compose.yml`:

```yaml
environment:
  POSTGRES_PASSWORD: your_new_password
```

Update `.env`:

```env
DATABASE_URL="postgresql://postgres:your_new_password@localhost:5432/cryptopulse"
```

Restart:

```bash
docker compose down -v
docker compose up -d
```

---

## 📦 Files Created

- `docker compose.yml` - Docker configuration
- `env-docker-template.txt` - Environment variables template
- `setup-docker.sh` - Automated setup script

---

## ✅ Checklist

- [ ] Cài đặt Docker Desktop
- [ ] Start Docker
- [ ] Update `.env` với DATABASE_URL mới
- [ ] Chạy `bash setup-docker.sh`
- [ ] Start server: `npm run dev`
- [ ] Test Interval Settings tại `/admin`

---

🎉 **Done!** PostgreSQL đang chạy trong Docker và sẵn sàng sử dụng!

