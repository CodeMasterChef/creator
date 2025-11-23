---
description: Continue CryptoPulse development – fix client‑side error, finalize page typings, ensure image domains, restart server, verify homepage and article generation.
---
# Workflow: Continue CryptoPulse Development

## Goal
- Resolve the client‑side exception on the homepage.
- Add proper TypeScript typings for articles.
- Configure allowed remote image domains.
- Restart the Next.js server and verify the UI.
- Ensure the auto‑generation (scraper + Gemini AI) works correctly.

## Steps
1. **Edit `src/app/page.tsx`**
   - Remove `export const revalidate = 0;`.
   - Declare an `Article` interface with `id, title, summary, image, date` fields.
   - Update the component to use `Article[]` and adjust JSX accordingly.
2. **Update `next.config.ts`**
   - Add `cdn.sanity.io` to `images.remotePatterns`.
3. **Restart the development server**
   - Kill any process on ports 3000/3001.
   - Delete `.next` cache folder.
   - Run `npm run dev`.
4. **Verify homepage**
   - Open `http://localhost:3001` (or 3000 if free).
   - Ensure no client‑side errors in the console.
   - Confirm article cards render with images and dates.
5. **Test admin generation button**
   - Navigate to `/admin`.
   - Click **“🚀 Test: Tạo Bài Ngay”**.
   - Verify a new article appears (Gemini AI or Google Translate fallback).
6. **Check Prisma Studio**
   - Run `npx prisma studio`.
   - Confirm the newly generated article is stored with correct fields.

## Expected Outcome
- Homepage loads without the “Application error: a client‑side exception” message.
- Articles display correctly with images from CoinDesk.
- Auto‑generation creates Vietnamese articles with proper metadata.
- No TypeScript lint errors remain.

---
