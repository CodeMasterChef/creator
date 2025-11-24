## Hướng Dẫn Deploy Lên Vercel

Tài liệu này mô tả toàn bộ quy trình đưa dự án **Thư Viện Tiền Số** lên Vercel, bao gồm chuẩn bị môi trường, cấu hình cơ sở dữ liệu, chạy migration/seed và kích hoạt cron. Sau khi làm xong một lần có thể lặp lại các bước ngắn gọn ở phần cuối.

---

### 1. Chuẩn Bị

| Yêu cầu | Chi tiết |
| --- | --- |
| Tài khoản Vercel | Đã tạo project và kết nối với repo GitHub này. |
| Vercel CLI | `npm i -g vercel` hoặc dùng `npx vercel`. |
| Prisma CLI | Đã sẵn trong `devDependencies`. |
| Database production | PostgreSQL (Vercel Postgres hoặc dịch vụ khác) hoạt động ổn định. |
| Env file local | Tạo `.env.production` để test production build/migrations tại local. |

**Lưu ý Uploads:** Ứng dụng hiện ghi file vào `public/uploads`. Hành vi này không bền trên Vercel (filesystem read‑only sau khi build). Trước khi production, hãy chuyển sang dịch vụ lưu trữ ngoài như S3, Supabase Storage… Nếu vẫn deploy nguyên trạng, upload trong Admin sẽ chỉ hoạt động tạm thời ở mỗi instance.

**Lưu ý Migration:** Prisma **không tự chạy migration production**. Khi thay đổi schema:
1. `npx prisma migrate dev --name my_change` tại local (cập nhật DB local + sinh file migration).
2. Commit migration cùng code rồi deploy.
3. Chạy `npx dotenv -e .env.production -- npx prisma migrate deploy` để áp dụng lên DB production (hoặc thêm bước đó vào build command nếu muốn tự động, nhưng cần đảm bảo chạy đúng lúc). Backup DB trước khi thực thi các thay đổi lớn.

---

### 2. Thiết Lập Environment Variables Trên Vercel

Đăng nhập Vercel → Project → **Settings → Environment Variables** và thêm:

| Key | Mô tả |
| --- | --- |
| `DATABASE_URL` | Connection string PostgreSQL production. |
| `NEXTAUTH_SECRET` | Secret ngẫu nhiên (có thể tạo bằng `openssl rand -hex 32`). |
| `NEXTAUTH_URL` | URL production, ví dụ `https://thuvientienso.com`. |
| `GEMINI_API_KEY` | Google Gemini API key. |
| `NEXT_PUBLIC_APP_URL` | Base URL public (dùng cho metadata). |
| Bất kỳ key khác đang dùng trong `.env.local` | Ví dụ `AUTH_SECRET`, `UPLOAD_TOKEN`, v.v. |

Sau khi cấu hình, có thể sync về local để chạy migration:

```bash
vercel env pull .env.production
```

---

### 3. Chuẩn Bị Database Production

1. Đảm bảo Postgres đã trống hoặc có schema tương thích.
2. Sinh Prisma Client với biến môi trường production:

```bash
npm install
npx dotenv -e .env.production -- npx prisma generate
```

3. Chạy migration lên production DB:

```bash
npx dotenv -e .env.production -- npx prisma migrate deploy
```

4. Seed dữ liệu cần thiết (admin user, thiết lập hệ thống):

```bash
npx dotenv -e .env.production -- npm run db:seed:vercel
```

5. (Tuỳ chọn) Kiểm tra truy cập DB:

```bash
npx dotenv -e .env.production -- npx prisma studio
```

---

### 4. Build & Kiểm Tra Production Tại Local

Trước khi deploy, nên chắc chắn build thành công với cấu hình production:

```bash
npx dotenv -e .env.production -- npm run build
npx dotenv -e .env.production -- npm start
```

Truy cập `http://localhost:3000` và test nhanh các chức năng quan trọng (load trang chủ, đăng nhập admin, cron manual, upload…).

> **Tip về thông báo “Environments: .env.local”**  
> Next.js luôn liệt kê danh sách các file env nó *tự động* load theo [thứ tự ưu tiên](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#environment-variable-load-order) (`.env.local`, `.env`, `.env.production`, …). Khi bạn chạy `npx dotenv -e .env.production`, lệnh này **chỉ export các biến** trong `.env.production` vào process trước khi gọi `next build`. Next.js vẫn hiển thị `.env.local` nếu file tồn tại, nhưng biến bạn inject từ `.env.production` sẽ *ghi đè* các biến trùng tên. Nếu muốn chắc chắn không dùng `.env.local`, tạm đổi tên hoặc xoá file này trong lúc build thử production.

---

### 5. Deploy Bằng Vercel CLI

1. Liên kết repo với Vercel (lần đầu):

```bash
vercel link
```

2. Deploy preview để kiểm tra:

```bash
vercel
```

3. Deploy production:

```bash
vercel deploy --prod
```

Vercel sẽ chạy `npm install --legacy-peer-deps` và `prisma generate && next build` (được định nghĩa trong `vercel.json`). Khi deploy thành công sẽ trả về URL production.

---

### 6. Cron & Background Job

`vercel.json` đã khai báo cron:

```json
{
  "crons": [
    { "path": "/api/cron/generate", "schedule": "0 0 * * *" }
  ]
}
```

Sau khi deploy production, cron tự động gọi API mỗi ngày lúc 00:00 UTC. Kiểm tra log tại Vercel → Project → Deployments → chọn deployment → tab **Functions/Logs** để chắc chắn cron chạy ổn định.

---

### 7. Checklist Sau Deploy

- [ ] Truy cập Production URL và xác minh trang chủ, chuyển trang bài viết.
- [ ] Đăng nhập Admin → kiểm tra bảng điều khiển, chức năng sửa/xoá/tạo bài viết.
- [ ] Thử gọi `POST /api/article/update` qua UI để đảm bảo Prisma kết nối DB OK.
- [ ] Kiểm tra API upload (nếu chưa chuyển sang storage ngoài, biết rằng file không bền).
- [ ] Đảm bảo cron tự động ghi log (xem bảng `GenerationLog`).
- [ ] Bật bảo vệ branch (tránh push trực tiếp gây deploy lỗi).

---

### 8. Quy Trình Nhanh Cho Lần Sau

1. `git push origin main` (Vercel auto deploy theo branch mặc định).  
2. Nếu có migration mới:
   ```bash
   npx dotenv -e .env.production -- npx prisma migrate deploy
   npx dotenv -e .env.production -- npm run db:seed:vercel   # nếu cần seed thêm
   ```
3. Theo dõi build trên Vercel Dashboard, kiểm tra logs.  
4. Thực hiện checklist sau deploy.

Giữ file này cập nhật nếu có thay đổi về hạ tầng (chuyển storage, thêm queue, đổi cron…). Chúc deploy vui vẻ!
