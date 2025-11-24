# 📰 Thư Viện Tiền Số - Crypto News Platform

> Nền tảng tin tức tiền điện tử tự động, được hỗ trợ bởi AI, dịch và xuất bản nội dung chất lượng cao từ các nguồn uy tín.

## ✨ Tính Năng

### 🤖 Tự Động Hóa
- Thu thập tin tức từ CoinDesk mỗi 2 giờ
- Dịch và viết lại bằng Google Gemini AI
- Tạo nội dung tiếng Việt tự nhiên và chuyên nghiệp
- Tự động xuất bản lên trang chủ

### 🎨 Giao Diện
- Thiết kế hiện đại, responsive
- Dark mode
- Layout giống báo chí chuyên nghiệp
- SEO-optimized

### 🔐 Bảo Mật
- Authentication với NextAuth.js
- XSS protection với HTML sanitization
- Rate limiting cho API endpoints
- PostgreSQL database cho production
- Environment variables cho secrets

### 👨‍💼 Quản Trị
- Admin dashboard đầy đủ
- Tạo, sửa, xóa bài viết
- Phát hiện bài trùng lặp
- Quản lý trạng thái xuất bản
- Thống kê tổng quan

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Production + Local Dev)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **AI**: Google Gemini AI
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Scraping**: Cheerio + Axios

## 📦 Cài Đặt

### Prerequisites

- Node.js 20+
- npm hoặc yarn
- PostgreSQL (for production + local dev via docker-compose)

### 🔧 Development Setup (Local)

**Môi trường:** PostgreSQL local (docker-compose), file `.env.local`

```bash
# 1. Clone repository
git clone https://github.com/your-username/thu-vien-tien-so.git
cd thu-vien-tien-so

# 2. Install dependencies
npm install

# 3. Start local Postgres
docker-compose up -d postgres

# 4. Setup environment variables
cp .env.local.example .env.local
# Edit .env.local với your credentials

# 5. Generate Prisma Client
npm run prisma:generate:local

# 6. Run database migrations (tạo tables)
npm run db:migrate:local

# 7. Create admin user (chỉ chạy 1 lần)
npm run db:seed:local

# 8. Start development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong browser.

### 🚀 Production Setup (Vercel)

**Môi trường:** PostgreSQL database, file `.env.vercel` (local testing) hoặc Vercel Environment Variables

#### Lần đầu tiên setup database:

```bash
# 1. Tạo file .env.vercel với DATABASE_URL từ Vercel Postgres
# DATABASE_URL="postgresql://user:password@host:5432/db"

# 2. Generate Prisma Client với Vercel env
npm run prisma:generate:vercel

# 3. Deploy migrations (tạo tables trong PostgreSQL)
npx dotenv -e .env.vercel -- npx prisma migrate deploy

# 4. Seed database (tạo admin user - chỉ chạy 1 lần)
npm run db:seed:vercel
```

#### Khi có schema changes:

```bash
# 1. Tạo migration mới (dev environment)
npx prisma migrate dev --name your_migration_name

# 2. Deploy migration lên production
npx dotenv -e .env.vercel -- npx prisma migrate deploy
```

#### Test production build locally:

```bash
# Build với production env
npx dotenv -e .env.vercel -- npm run build

# Start production server
npx dotenv -e .env.vercel -- npm start
```

### 📊 Tóm tắt: Khi nào cần khởi tạo Database?

| Tình huống | Commands cần chạy | Ghi chú |
|------------|-------------------|---------|
| **Lần đầu setup Dev** | `npm run db:migrate:local` → `npm run db:seed:local` | Tạo PostgreSQL local database + tables + admin user |
| **Lần đầu setup Production** | `npx dotenv -e .env.vercel -- npx prisma migrate deploy` → `npm run db:seed:vercel` | Tạo tables trong PostgreSQL + admin user |
| **Có thay đổi schema** | Dev: `npm run db:migrate:local -- --name xyz`<br/>Prod: `npx dotenv -e .env.vercel -- npx prisma migrate deploy` | Cập nhật cấu trúc database |
| **Reset database** | `npm run db:reset` (dev only) | ⚠️ XÓA toàn bộ data và tạo lại |
| **Chỉ cần admin user mới** | `npm run db:seed` hoặc `npm run db:seed:vercel` | Có thể chạy nhiều lần (upsert) |

**⚠️ Lưu ý quan trọng:**
- **Development**: Sử dụng PostgreSQL local (docker-compose) với `.env.local` tách biệt
- **Production**: Sử dụng PostgreSQL (Vercel Postgres), data lưu trên cloud
- **Seed script** có thể chạy nhiều lần an toàn (sử dụng `upsert`)
- **Migration** phải chạy trước khi seed (tạo tables trước, insert data sau)

## 🔧 Configuration

### Environment Variables

Xem `ENV_SETUP_GUIDE.md` cho hướng dẫn chi tiết.

Dev: copy `.env.local.example` → `.env.local` (dùng DB local). Prod: cấu hình trên Vercel hoặc `.env.vercel` khi test production build local.

Required variables:
- `DATABASE_URL`: Database connection string
- `AUTH_SECRET`: NextAuth secret key
- `GEMINI_API_KEY`: Google Gemini API key
- `NEXTAUTH_URL`: Application URL

### Database

```bash
# Development (Local Postgres via docker-compose)
DATABASE_URL="postgresql://postgres:postgres123@localhost:5433/cryptopulse"

# Production (Vercel Postgres)
DATABASE_URL="postgresql://user:password@host:5432/db"
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Hướng dẫn deploy lên Vercel
- [Migration Guide](MIGRATION_GUIDE.md) - SQLite → PostgreSQL
- [Security Checklist](SECURITY_CHECKLIST.md) - Rà soát bảo mật
- [Environment Setup](ENV_SETUP_GUIDE.md) - Cấu hình môi trường

## 🏗️ Project Structure

```
thu-vien-tien-so/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Database seeding
├── public/                    # Static assets
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/             # API routes
│   │   ├── article/         # Article pages
│   │   └── page.tsx         # Homepage
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   │   ├── auth.ts         # Authentication
│   │   ├── sanitize.ts     # XSS protection
│   │   ├── rate-limit.ts   # Rate limiting
│   │   ├── auto-generator.ts # AI content generation
│   │   └── scraper.ts      # Web scraping
│   └── types/              # TypeScript types
├── scripts/                 # Utility scripts
└── .env.local.example      # Environment template
```

## 🎯 Usage

### Admin Panel

1. Đăng nhập: `https://your-domain.com/admin/login`
2. Email: `admin@thuvientienso.com`
3. Password: (set trong seed script)

### Generating Articles

**Manual:**
- Vào Admin Dashboard
- Click "Tạo Bài Viết Mới"

**Automatic:**
- Cron job chạy mỗi 2 giờ
- Tự động tạo 3 bài mới

**Batch:**
```bash
npx tsx scripts/generate-batch.ts 10
```

### Database Management

```bash
# Open Prisma Studio
npm run db:studio

# Create migration
npm run db:migrate

# Deploy migrations
npx prisma migrate deploy

# Seed database
npm run db:seed

# View database
npx tsx view_db.ts
```

## 🧪 Testing

```bash
# Build for production
npm run build

# Start production server locally
npm start

# Lint code
npm run lint
```

## 📈 Performance

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2.5s
- Cumulative Layout Shift: < 0.1

## 🔒 Security

- ✅ HTTPS enforced
- ✅ Authentication required for admin
- ✅ Rate limiting on API endpoints
- ✅ XSS protection with HTML sanitization
- ✅ SQL injection protection via Prisma ORM
- ✅ Environment variables for secrets
- ✅ CSRF protection via NextAuth
- ✅ Secure password hashing (bcrypt)

See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for details.

## 🚀 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/thu-vien-tien-so)

### Manual Deployment

Xem [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) cho hướng dẫn chi tiết.

Tóm tắt:
1. Push code to GitHub
2. Import project vào Vercel
3. Create Vercel Postgres database
4. Configure environment variables
5. Deploy!

## 🤝 Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Google Gemini](https://ai.google.dev/) - AI content generation
- [CoinDesk](https://www.coindesk.com/) - News source
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📞 Contact

- Website: [thuvientienso.vercel.app](https://thuvientienso.vercel.app)
- Email: admin@thuvientienso.com

## 🗺️ Roadmap

- [ ] Email notifications
- [ ] Comment system
- [ ] Search functionality
- [ ] Multiple language support
- [ ] RSS feed
- [ ] Social sharing optimization
- [ ] Progressive Web App (PWA)
- [ ] Advanced analytics

---

Made with ❤️ for the Vietnamese crypto community
