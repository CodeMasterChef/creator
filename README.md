# CryptoPulse - Hệ Thống Tổng Hợp Tin Tức Crypto Tự Động

Website tự động thu thập, tổng hợp và xuất bản tin tức về thị trường tiền điện tử từ nhiều nguồn uy tín.

## 🚀 Tính Năng

- ✅ **Tự động thu thập tin tức** từ 4 nguồn RSS: Cointelegraph, CoinDesk, Decrypt, CryptoSlate
- ✅ **Tự động dịch sang tiếng Việt** - Tiêu đề và nội dung được dịch tự động bằng Google Translate API
- ✅ **Tự động tạo bài viết** mỗi 2 giờ (có thể tùy chỉnh)
- ✅ **Database SQLite** để quản lý nội dung
- ✅ **Admin Dashboard** với xác thực (authentication)
- ✅ **SEO-optimized** với metadata đầy đủ
- ✅ **Responsive design** với dark/light mode
- ✅ **Kiểm tra trùng lặp** - không tạo bài viết đã tồn tại
- ✅ **Test button** trong admin để test tính năng ngay lập tức

## 📋 Yêu Cầu Hệ Thống

- Node.js 18+ 
- npm hoặc yarn

## 🛠️ Cài Đặt

1. **Clone repository** (nếu có) hoặc đảm bảo bạn đang ở thư mục dự án

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Thiết lập database:**
```bash
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

4. **Chạy development server:**
```bash
npm run dev
```

5. **Mở trình duyệt:** http://localhost:3000

## 🔐 Thông Tin Đăng Nhập Admin

- **URL:** http://localhost:3000/admin/login
- **Email:** admin@creator.com
- **Password:** admin123

## 📁 Cấu Trúc Dự Án

```
/Users/n/Code/creator/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed data (admin user)
│   └── migrations/        # Database migrations
├── src/
│   ├── app/
│   │   ├── page.tsx              # Trang chủ
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   └── login/page.tsx    # Trang đăng nhập
│   │   ├── article/[id]/page.tsx # Chi tiết bài viết
│   │   └── api/auth/             # NextAuth API routes
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client
│   │   ├── auth.ts               # NextAuth config
│   │   ├── auto-generator.ts    # Logic tạo bài tự động
│   │   └── scheduler.ts          # Cron job scheduler
│   └── types/
│       └── next-auth.d.ts        # TypeScript definitions
└── .env                          # Environment variables
```

## ⚙️ Cấu Hình

### Thay Đổi Tần Suất Tự Động Tạo Bài

Mở file `src/lib/scheduler.ts` và sửa cron expression:

```typescript
// Mỗi 2 giờ (mặc định)
cron.schedule('0 */2 * * *', ...)

// Mỗi 1 giờ
cron.schedule('0 * * * *', ...)

// Mỗi 30 phút
cron.schedule('*/30 * * * *', ...)

// Mỗi ngày lúc 9:00 sáng
cron.schedule('0 9 * * *', ...)
```

### Thêm/Bớt Nguồn RSS

Mở file `src/lib/auto-generator.ts` và chỉnh sửa mảng `RSS_SOURCES`:

```typescript
const RSS_SOURCES = [
    { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    // Thêm nguồn mới ở đây
];
```

## 🗄️ Database

Dự án sử dụng **SQLite** với Prisma ORM.

### Models:

**User** - Quản lý admin users
- id, email, password (hashed), name, role

**Article** - Quản lý bài viết
- id, title, summary, content, image
- source, sourceUrl (để tracking và tránh trùng lặp)
- isPublished, date, createdAt, updatedAt

### Prisma Commands:

```bash
# Xem database trong Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Tạo migration mới
npx prisma migrate dev --name your_migration_name
```

## 🔄 Cách Hoạt Động

1. **Server khởi động** → Scheduler bắt đầu chạy
2. **Ngay lập tức** → Tạo bài viết đầu tiên
3. **Mỗi 2 giờ** → Tự động:
   - Chọn ngẫu nhiên 1 trong 4 nguồn RSS
   - Lấy 1 bài viết ngẫu nhiên trong top 10 mới nhất
   - Kiểm tra xem đã tồn tại chưa (qua sourceUrl)
   - **Dịch tiêu đề và nội dung sang tiếng Việt**
   - Nếu chưa có → Tạo và lưu vào database
   - Tự động xuất bản (isPublished = true)

## 🎨 Tùy Chỉnh Giao Diện

Các biến CSS được định nghĩa trong `src/app/globals.css`:

```css
:root {
  --accent-primary: #3b82f6;
  --glass-bg: rgba(255, 255, 255, 0.05);
  /* ... */
}
```

## 🚀 Deploy Production

### Build:
```bash
npm run build
npm start
```

### Environment Variables (Production):
Tạo file `.env.production`:
```
DATABASE_URL="file:./prod.db"
NEXTAUTH_SECRET="your-very-secure-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"
```

## 📝 TODO / Cải Tiến Tương Lai

- [ ] Tích hợp AI API (OpenAI/Gemini) để viết lại nội dung
- [ ] Thêm chức năng edit/delete bài viết trong admin
- [ ] Upload ảnh tùy chỉnh
- [ ] Phân loại bài viết theo category/tags
- [ ] Tìm kiếm và filter
- [ ] Analytics dashboard
- [ ] Email notifications khi có bài mới

## 🐛 Troubleshooting

**Lỗi: "Module not found"**
```bash
npm install
npx prisma generate
```

**Lỗi: "Database locked"**
```bash
# Dừng tất cả dev servers và chạy lại
npm run dev
```

**Scheduler không chạy:**
- Kiểm tra console logs
- Đảm bảo server đang chạy liên tục (không restart)

## 📄 License

MIT

## 👨‍💻 Tác Giả

Được xây dựng với Next.js 16, Prisma, NextAuth và ❤️
