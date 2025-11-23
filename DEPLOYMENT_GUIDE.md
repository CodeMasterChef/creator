# 🚀 Hướng Dẫn Deploy Lên Vercel

## Tổng Quan
Dự án sẵn sàng deploy với đầy đủ cấu hình bảo mật và tối ưu hóa.

## ✅ Checklist Trước Khi Deploy

### Bảo Mật
- [x] Auth SECRET configuration
- [x] XSS protection (HTML sanitization)
- [x] Rate limiting
- [x] API authentication
- [x] Environment variables documented

### Database
- [x] PostgreSQL schema ready
- [x] Migration files created
- [x] Seed script for admin user

### Configuration
- [x] vercel.json configured
- [x] Build scripts updated
- [x] Cron jobs configured
- [x] SEO (sitemap, robots.txt)

---

## 📋 Bước 1: Chuẩn Bị Repository

### 1.1 Tạo Git Repository (nếu chưa có)

```bash
# Khởi tạo git repository
git init

# Thêm tất cả files
git add .

# Commit lần đầu
git commit -m "feat: production-ready deployment with security"
```

### 1.2 Tạo GitHub Repository

1. Vào https://github.com/new
2. Tạo repository **PRIVATE** (quan trọng!)
3. Tên gợi ý: `thu-vien-tien-so`
4. **KHÔNG** chọn "Initialize with README"

### 1.3 Push Code Lên GitHub

```bash
# Thay YOUR_USERNAME và YOUR_REPO bằng thông tin thực
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 📋 Bước 2: Setup Vercel Account

### 2.1 Tạo Tài Khoản Vercel

1. Vào https://vercel.com/signup
2. Chọn "Continue with GitHub"
3. Authorize Vercel truy cập GitHub

### 2.2 Import Project

1. Vào https://vercel.com/new
2. Chọn "Import Git Repository"
3. Tìm và chọn repository `thu-vien-tien-so`
4. Click "Import"

### 2.3 Configure Project

Trong màn hình import:
- **Framework Preset**: Next.js (tự động detect)
- **Root Directory**: `./`
- **Build Command**: Để mặc định (sẽ dùng từ vercel.json)
- Chưa add environment variables (làm ở bước sau)

**CHƯA** click Deploy, chuyển sang Bước 3 trước!

---

## 📋 Bước 3: Tạo Vercel Postgres Database

### 3.1 Tạo Database

1. Trong Vercel Dashboard, vào project vừa import
2. Click tab **Storage**
3. Click **Create Database**
4. Chọn **Postgres**
5. **Database Name**: `thu-vien-tien-so-db`
6. **Region**: Chọn `Singapore (sin1)` (gần Việt Nam nhất)
7. Click **Create**

### 3.2 Lấy Connection Strings

Sau khi database được tạo:

1. Click vào database vừa tạo
2. Vào tab **Quickstart** hoặc **.env.local**
3. Copy các connection strings:

```bash
# Copy these values:
POSTGRES_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
```

---

## 📋 Bước 4: Configure Environment Variables

### 4.1 Generate AUTH_SECRET

Chạy command sau trong terminal:

```bash
openssl rand -base64 32
```

Copy kết quả để dùng cho `AUTH_SECRET`.

### 4.2 Thêm Environment Variables Vào Vercel

1. Trong Vercel project, vào **Settings**
2. Click **Environment Variables**
3. Thêm từng biến sau:

#### Required Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | `<POSTGRES_URL từ bước 3.2>` | Production, Preview |
| `DIRECT_URL` | `<POSTGRES_URL_NON_POOLING từ bước 3.2>` | Production, Preview |
| `AUTH_SECRET` | `<từ openssl command>` | Production, Preview, Development |
| `AUTH_TRUST_HOST` | `true` | Production, Preview |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://*.vercel.app` | Preview |
| `GEMINI_API_KEY` | `<your_gemini_key>` | Production, Preview |
| `NODE_ENV` | `production` | Production |

#### Optional (for Cron):

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `CRON_SECRET` | `<generate another secret>` | Production, Preview |

**Lưu ý về NEXTAUTH_URL:**
- Production: Dùng URL chính xác (sẽ có sau khi deploy)
- Preview: Dùng `https://*.vercel.app` để wildcard cho preview URLs
- Có thể update sau khi có URL chính xác

### 4.3 Verify Variables

Sau khi thêm tất cả, double-check:
- ✅ Tất cả variables có checkmark ở Production
- ✅ AUTH_SECRET và CRON_SECRET khác nhau
- ✅ DATABASE_URL và DIRECT_URL khác nhau

---

## 📋 Bước 5: Deploy!

### 5.1 Trigger Deployment

1. Vào tab **Deployments**
2. Click **Redeploy** (nếu đã có deployment failed)
   HOẶC
3. Push một commit mới:

```bash
git commit --allow-empty -m "trigger: initial deployment"
git push
```

### 5.2 Monitor Deployment

1. Xem logs trong Vercel Dashboard
2. Build sẽ mất ~2-3 phút
3. Kiểm tra các bước:
   - ✅ Installing dependencies
   - ✅ Running `prisma generate`
   - ✅ Running `prisma migrate deploy`
   - ✅ Building Next.js
   - ✅ Deployment complete

### 5.3 Lấy Production URL

Sau khi deploy thành công:
1. URL sẽ hiện dạng: `https://thu-vien-tien-so-xxx.vercel.app`
2. Copy URL này

### 5.4 Update NEXTAUTH_URL

1. Vào **Settings** → **Environment Variables**
2. Tìm `NEXTAUTH_URL` (Production)
3. Thay `https://your-project.vercel.app` bằng URL thực tế
4. Save
5. Redeploy để apply thay đổi

---

## 📋 Bước 6: Tạo Admin User

### 6.1 Option A: Sử dụng Seed Script (Recommended)

```bash
# Set environment variables locally
export DATABASE_URL="<POSTGRES_URL from Vercel>"
export ADMIN_EMAIL="admin@thuvientienso.com"
export ADMIN_PASSWORD="YourSecurePassword123!"

# Run seed
npm run db:seed
```

### 6.2 Option B: Sử dụng Prisma Studio

```bash
# Connect to production database
npx prisma studio --url="<POSTGRES_URL from Vercel>"
```

Trong Prisma Studio:
1. Mở table `User`
2. Click "Add record"
3. Điền thông tin:
   - `email`: admin@thuvientienso.com
   - `password`: Cần hash trước! Dùng: https://bcrypt-generator.com/ (rounds: 10)
   - `name`: Admin
   - `role`: admin
4. Save

### 6.3 Verify Admin User

1. Vào `https://your-app.vercel.app/admin/login`
2. Login với credentials vừa tạo
3. Nếu thành công → ✅ Setup hoàn tất!

---

## 📋 Bước 7: Test Production

### 7.1 Critical Tests

1. **Homepage**: Vào `/` - xem articles load
2. **Admin Login**: Vào `/admin/login` - login thành công
3. **Generate Article**: Trong Admin, click "Tạo Bài Viết Mới"
4. **View Article**: Click vào article vừa tạo
5. **Edit Article**: Test edit từ article page (nếu logged in)
6. **Public Access**: Test trong incognito - không thấy admin buttons

### 7.2 Performance Tests

1. **Lighthouse Score**: 
   - Vào Chrome DevTools → Lighthouse
   - Run audit cho production URL
   - Target: Performance > 90

2. **Response Time**:
   - Homepage load < 2s
   - Article page load < 1.5s

### 7.3 Security Tests

1. **Try accessing /admin without login** → Should redirect to login
2. **Try calling /api/generate without auth** → Should return 401
3. **Check rate limiting**: Make 6+ login attempts → Should get 429

---

## 📋 Bước 8: Setup Cron Jobs (Optional but Recommended)

### 8.1 Enable Vercel Cron

Vercel Cron được config trong `vercel.json` rồi, nhưng cần verify:

1. Vào Vercel Dashboard → Project
2. Tab **Cron** (nếu có)
3. Verify schedule: "0 */2 * * *" (every 2 hours)

### 8.2 Test Cron Manually

```bash
# Call cron endpoint manually
curl -X GET https://your-app.vercel.app/api/cron/generate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Should return:
```json
{
  "success": true,
  "message": "Generated X articles",
  "results": { ... }
}
```

---

## 📋 Bước 9: Post-Deployment

### 9.1 Update Environment Guide

Update file `ENV_SETUP_GUIDE.md` với production URLs thực tế.

### 9.2 Setup Monitoring

1. **Vercel Analytics**: 
   - Vào Settings → Analytics
   - Enable Web Analytics (free)

2. **Error Tracking**:
   - Monitor Vercel logs: Settings → Logs
   - Check daily for errors

### 9.3 Backup Strategy

1. **Database Backup**: 
   - Vercel Postgres có auto-backup
   - Verify: Storage → Your DB → Backups

2. **Manual Backup** (recommended weekly):
```bash
# Export articles
DATABASE_URL="your_postgres_url" npx tsx view_db.ts > backup_$(date +%Y%m%d).txt
```

---

## 📋 Bước 10: Custom Domain (Optional)

### 10.1 Mua Domain

Nơi mua domain rẻ cho VN:
- **Tên Miền Việt**: https://www.tenmienviet.vn/
- **Mat Bao**: https://matbao.net/
- **Namecheap**: https://www.namecheap.com/

Gợi ý tên miền:
- `thuvientienso.com`
- `cryptopulse.vn`
- `tintucc crypto.vn`

### 10.2 Add Domain to Vercel

1. Vào Settings → Domains
2. Add domain của bạn
3. Vercel sẽ cho DNS records cần add

### 10.3 Configure DNS

Tại nhà cung cấp domain:
1. Add A record: `@` → `76.76.21.21`
2. Add CNAME: `www` → `cname.vercel-dns.com`
3. Wait 24-48h cho DNS propagate

### 10.4 Update Environment Variables

Sau khi domain hoạt động:
1. Update `NEXTAUTH_URL` từ Vercel URL sang custom domain
2. Redeploy

---

## 🎉 Hoàn Tất!

Website của bạn đã LIVE tại:
- 🌐 Production: https://your-app.vercel.app
- 🔐 Admin: https://your-app.vercel.app/admin
- 📊 Analytics: Vercel Dashboard

## 🔄 Vận Hành Hàng Ngày

### Daily Tasks
- Check Vercel logs cho errors
- Verify cron job chạy (every 2 hours)
- Monitor database storage usage

### Weekly Tasks
- Backup database manually
- Review và delete duplicate articles (trong Admin)
- Check Gemini API quota

### Monthly Tasks
- Update dependencies: `npm outdated`
- Security audit: `npm audit`
- Review analytics data

---

## 🆘 Troubleshooting

### Issue: Build fails on Vercel

**Check:**
1. All environment variables set correctly
2. DATABASE_URL format correct
3. DIRECT_URL is the non-pooling URL
4. Build logs in Vercel for specific error

**Fix:**
```bash
# Test build locally first
npm run build
```

### Issue: Can't login to admin

**Check:**
1. Admin user created in database
2. Password hashed correctly (bcrypt)
3. AUTH_SECRET set in Vercel
4. NEXTAUTH_URL matches your domain

**Fix:**
- Re-create admin user with seed script
- Check Vercel logs for auth errors

### Issue: Cron job not running

**Check:**
1. CRON_SECRET set in environment
2. Cron endpoint accessible: `/api/cron/generate`
3. Vercel Cron enabled for your plan

**Fix:**
- Test cron endpoint manually with curl
- Check Function logs in Vercel

### Issue: Rate limit errors

**Temporary fix:**
- Wait for rate limit window to reset
- Or temporarily increase limits in `src/lib/rate-limit.ts`

### Issue: Database connection errors

**Check:**
1. DATABASE_URL and DIRECT_URL both set
2. Database not paused (Vercel free tier)
3. Connection string includes `?sslmode=require`

**Fix:**
```bash
# Test connection locally
DATABASE_URL="your_url" npx prisma db push
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

## 🎓 Học Thêm

Sau khi deploy thành công, bạn có thể:
1. Thêm Google Analytics
2. Setup email notifications (Resend)
3. Add comment system (Giscus)
4. Implement search functionality
5. Add more AI providers (Claude, GPT)

Chúc mừng bạn đã deploy thành công! 🚀


