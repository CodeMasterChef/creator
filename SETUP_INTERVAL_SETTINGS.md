# 🔧 Cài Đặt Interval Settings

## Tính Năng Mới

Bây giờ bạn có thể thay đổi khoảng thời gian tự động tạo bài viết trực tiếp từ Admin Dashboard!

### Các Thay Đổi

1. ✅ **Component IntervalSettings** - UI để chỉnh sửa interval
2. ✅ **API Route** - `/api/settings/interval` để lưu settings
3. ✅ **Database Table** - `SystemSettings` lưu cấu hình
4. ✅ **Dynamic Scheduler** - Tự động restart khi settings thay đổi

---

## 📦 Cài Đặt

### Bước 1: Chạy Migration

```bash
cd /Users/n/Code/creator
npx prisma migrate dev --name add_system_settings
```

### Bước 2: Generate Prisma Client

```bash
npx prisma generate
```

### Bước 3: Restart Server

```bash
# Kill server cũ
pkill -f "next dev"

# Start lại
npm run dev
```

---

## 🎯 Cách Sử Dụng

1. Đăng nhập vào **Admin Dashboard**: `http://localhost:3000/admin`
2. Tìm phần **"⚡ Cập nhật tự động"**
3. Click nút **"Thay đổi"**
4. Nhập:
   - **Số lượng**: Ví dụ `30`, `1`, `2`...
   - **Đơn vị**: `Phút` hoặc `Giờ`
5. Click **"Lưu cài đặt"**
6. ✅ Scheduler sẽ tự động restart với interval mới!

---

## 💡 Ví Dụ

- **30 phút**: Chạy mỗi 30 phút
- **1 giờ**: Chạy mỗi 1 giờ
- **2 giờ**: Chạy mỗi 2 giờ (mặc định)
- **6 giờ**: Chạy mỗi 6 giờ

---

## 🗄️ Database Schema

```prisma
model SystemSettings {
  id                    String   @id @default(cuid())
  generationInterval    Int      @default(120)  // Interval in minutes
  updatedAt             DateTime @updatedAt
}
```

---

## 📝 Files Đã Thay Đổi

1. **prisma/schema.prisma** - Added `SystemSettings` model
2. **src/components/IntervalSettings.tsx** - New UI component
3. **src/app/api/settings/interval/route.ts** - New API route
4. **src/app/admin/page.tsx** - Integrated IntervalSettings
5. **src/lib/scheduler.ts** - Dynamic scheduler with restart capability

---

## ⚠️ Lưu Ý

- Interval được lưu trong **database**, không còn dùng `.env`
- Mặc định: **120 phút (2 giờ)**
- Scheduler tự động restart khi bạn thay đổi settings
- Nếu scheduler không restart, hãy restart server thủ công

---

## 🐛 Troubleshooting

### Lỗi: "SystemSettings table not found"
```bash
npx prisma migrate dev --name add_system_settings
npx prisma generate
```

### Lỗi: "Scheduler not restarting"
```bash
# Restart server
pkill -f "next dev"
npm run dev
```

### Lỗi: "Cannot update settings"
- Kiểm tra bạn đã đăng nhập Admin
- Kiểm tra database connection
- Xem console logs

---

✅ **Done!** Bây giờ bạn có thể tùy chỉnh interval trực tiếp từ Admin Dashboard! 🎉

