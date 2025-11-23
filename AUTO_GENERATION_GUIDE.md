# 🔄 Hướng Dẫn Tính Năng Tự Động Cập Nhật

## Tổng Quan

Hệ thống có tính năng tự động tạo bài viết mới từ CoinDesk theo lịch trình đã cấu hình. Bạn có thể BẬT/TẮT tính năng này bất cứ lúc nào từ trang Admin.

---

## 🎛️ Cách Sử Dụng

### 1. Truy Cập Trang Admin

```
https://your-domain.com/admin
```

### 2. Tìm Phần "Tự Động Cập Nhật"

Ở đầu trang Admin, bạn sẽ thấy một card với toggle switch:

```
┌─────────────────────────────────────┐
│ ⚡ Tự Động Cập Nhật                │
│                                      │
│ [ĐANG BẬT] Hệ thống sẽ tự động...  │
│                            [ON/OFF] │
└─────────────────────────────────────┘
```

### 3. Bật/Tắt Tính Năng

**Để TẮT tự động cập nhật:**
1. Click vào toggle switch (chuyển từ xanh sang xám)
2. Hệ thống sẽ hiển thị: "⏸️ Tự động cập nhật đã được TẮT"
3. Trang tự động reload

**Để BẬT lại:**
1. Click vào toggle switch (chuyển từ xám sang xanh)
2. Hệ thống sẽ hiển thị: "✅ Tự động cập nhật đã được BẬT"
3. Scheduler sẽ restart và tiếp tục hoạt động

---

## 📊 Trạng Thái Hệ Thống

### Khi Đang BẬT (ON)
- **Biểu tượng**: ⚡ Power (màu xanh)
- **Status badge**: `ĐANG BẬT` (màu xanh)
- **Mô tả**: "Hệ thống sẽ tự động tạo bài viết mới theo lịch đã cấu hình"
- **Hành động**: Scheduler đang chạy, tự động tạo 3 bài mỗi X phút (theo cấu hình)

### Khi Đang TẮT (OFF)
- **Biểu tượng**: ⏸️ PowerOff (màu đỏ)
- **Status badge**: `ĐANG TẮT` (màu đỏ)
- **Mô tả**: "Hệ thống không tự động tạo bài viết. Chỉ có thể tạo thủ công."
- **Cảnh báo**: Hiển thị warning box màu vàng
- **Hành động**: Scheduler đã dừng, không tự động tạo bài

---

## ⚙️ Cách Hoạt Động (Technical)

### Database Schema

```prisma
model SystemSettings {
  id                    String   @id @default(cuid())
  autoGenerationEnabled Boolean  @default(true)  // ON/OFF switch
  generationInterval    Int      @default(120)   // Minutes
  updatedAt             DateTime @updatedAt
}
```

### Workflow

1. **Khi BẬT**:
   ```
   User clicks ON 
   → API updates DB (autoGenerationEnabled = true)
   → restartScheduler() is called
   → Cron job starts running
   → Auto-generates 3 articles every X minutes
   ```

2. **Khi TẮT**:
   ```
   User clicks OFF
   → API updates DB (autoGenerationEnabled = false)
   → stopScheduler() is called
   → Cron job stops
   → No automatic generation
   ```

3. **Server Restart**:
   ```
   Server starts
   → Check DB: autoGenerationEnabled?
   → If TRUE: Start scheduler
   → If FALSE: Don't start, log message
   ```

### API Endpoint

**POST** `/api/settings/toggle-generation`

**Request Body:**
```json
{
  "enabled": true  // or false
}
```

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "message": "Auto-generation enabled and scheduler restarted"
}
```

**Authentication**: Requires admin login

---

## 🛡️ Tính Năng Bảo Mật

### 1. Authentication Check
- Chỉ admin đã login mới có thể bật/tắt
- Unauthorized request → 401 error

### 2. Validation
- Type checking: `enabled` phải là boolean
- Invalid input → 400 error

### 3. Error Handling
- API errors được log và trả về 500
- UI hiển thị error message nếu toggle fail

---

## 🔧 Use Cases

### Khi Nào Nên TẮT?

1. **Bảo trì hệ thống**
   - Đang fix bug hoặc update code
   - Không muốn bài mới được tạo trong lúc maintain

2. **Kiểm soát nội dung**
   - Muốn review thủ công từng bài trước khi publish
   - Tạm dừng để clean up duplicate articles

3. **Tiết kiệm quota**
   - Gemini API quota sắp hết
   - Không muốn waste API calls

4. **Testing**
   - Đang test manual generation
   - Không muốn scheduler chạy trong khi debug

### Khi Nào Nên BẬT?

1. **Production mode**
   - Website đang live, cần content liên tục
   - Muốn automated workflow

2. **Sau khi bảo trì xong**
   - Fix bugs done, ready to resume

3. **Khi có tin nóng**
   - Crypto market đang có biến động lớn
   - Muốn catch breaking news nhanh

---

## 📝 Tạo Bài Thủ Công (Manual)

Khi tắt tự động cập nhật, bạn vẫn có thể tạo bài thủ công:

### Cách 1: Từ Admin Dashboard

1. Vào trang Admin
2. Tìm card "📰 Tạo Bài Viết Mới (Thủ Công)"
3. Click nút "Generate Article"
4. Đợi 30-60 giây
5. Bài mới sẽ xuất hiện trong danh sách

### Cách 2: Dùng Script

```bash
# Generate 1 article
npm run generate

# Generate batch of 3 articles
npx tsx scripts/generate-batch.ts
```

### Cách 3: API Call

```bash
curl -X POST https://your-domain.com/api/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"
```

---

## 🐛 Troubleshooting

### Toggle Switch Không Hoạt Động

**Triệu chứng**: Click toggle nhưng không đổi màu

**Giải pháp**:
1. Check console browser: `F12` → Console tab
2. Kiểm tra auth: Đảm bảo đã login
3. Reload page: `Ctrl+R` hoặc `Cmd+R`
4. Check server logs: Xem terminal/Vercel logs

### Scheduler Không Chạy Sau Khi Bật

**Triệu chứng**: Đã bật ON nhưng không có bài mới

**Giải pháp**:
1. Check server logs:
   ```
   ✅ Auto-generation scheduler started
   ```
2. Verify DB:
   ```bash
   npx prisma studio
   # Check SystemSettings → autoGenerationEnabled = true
   ```
3. Restart server:
   ```bash
   npm run restart
   ```

### Warning: "Scheduler already running"

**Triệu chứng**: Log hiển thị warning này

**Giải pháp**:
- Đây là warning bình thường khi hot-reload
- Scheduler đã chạy rồi, không cần lo
- Nếu muốn restart: Stop server → Start lại

### Bài Viết Không Được Tạo Đúng Giờ

**Triệu chứng**: Lịch là 2 giờ/lần nhưng không chạy

**Giải pháp**:
1. Check interval settings:
   ```bash
   npx prisma studio
   # SystemSettings → generationInterval
   ```
2. Verify cron expression trong logs:
   ```
   📅 Cron expression: 0 */2 * * *
   ```
3. Check GenerationLog table:
   ```sql
   SELECT * FROM GenerationLog ORDER BY startedAt DESC LIMIT 5;
   ```

---

## 📈 Monitoring

### 1. Check Scheduler Status

**Via Admin Dashboard:**
- Xem phần "Generation Logs"
- Logs hiển thị lần chạy gần nhất
- Success/Failed count

**Via Server Logs:**
```bash
# Development
npm run dev
# Look for:
# ✅ Auto-generation scheduler started
# 🤖 Auto-generating articles...
```

### 2. Database Checks

```bash
# Xem settings hiện tại
npx prisma studio
# → SystemSettings table

# Xem generation history
# → GenerationLog table
```

### 3. API Health Check

```bash
# Check nếu API hoạt động
curl https://your-domain.com/api/settings/toggle-generation \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

---

## 🚀 Production Deployment

### Vercel Environment

Khi deploy lên Vercel, cần lưu ý:

1. **Cron Jobs**: 
   - Vercel có giới hạn cron job execution time (10s default, max 60s)
   - Nếu generation quá lâu, có thể timeout
   - Solution: Dùng dedicated cron route với timeout cao hơn

2. **Stateless Scheduler**:
   - Vercel serverless, mỗi request là instance mới
   - Scheduler trong memory sẽ không persist
   - Solution: Dùng Vercel Cron Jobs (vercel.json)

### vercel.json Configuration

```json
{
  "crons": [{
    "path": "/api/cron/generate",
    "schedule": "0 */2 * * *"
  }]
}
```

**Note**: Vercel Cron sẽ gọi API endpoint, không dùng node-cron trong memory.

### Database Toggle Still Works

Toggle ON/OFF vẫn hoạt động bình thường trên production:
- API route check DB trước khi generate
- Nếu `autoGenerationEnabled = false`, skip generation
- Log message: "⏸️ Auto-generation disabled, skipping"

---

## 📚 Related Files

### Frontend
- `src/components/AutoGenerationToggle.tsx` - Toggle UI component
- `src/app/admin/page.tsx` - Admin dashboard integration

### Backend
- `src/app/api/settings/toggle-generation/route.ts` - Toggle API
- `src/lib/scheduler.ts` - Scheduler logic
- `prisma/schema.prisma` - Database schema

### Config
- `vercel.json` - Vercel cron jobs (production)

---

## ✅ Best Practices

1. **Always check logs** after toggling
2. **Test in development** before deploying
3. **Monitor GenerationLog** for issues
4. **Keep Gemini API quota** in mind
5. **Backup database** before major changes

---

**Last Updated**: 2025-11-23  
**Feature Version**: 1.0  
**Status**: ✅ Production Ready

