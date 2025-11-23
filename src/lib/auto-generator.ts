import Parser from 'rss-parser';
import { prisma } from './prisma';
import { translate as googleTranslate } from '@vitalets/google-translate-api';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLatestCoinDeskArticles, scrapeCoinDeskArticle } from './scraper';

const parser = new Parser();
const RSS_SOURCES = [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' }
];

const FALLBACK_IMAGES = [
    "https://placehold.co/600x400?text=Thi+Truong+Crypto",
    "https://placehold.co/600x400?text=Cong+Nghe+Blockchain",
    "https://placehold.co/600x400?text=Tai+San+So",
    "https://placehold.co/600x400?text=Bieu+Do+Giao+Dich"
];

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

async function translateWithGemini(title: string, content: string): Promise<{ title: string; content: string; success: boolean }> {
    if (!genAI) {
        console.log('⚠️ Gemini API key not found, using Google Translate');
        return { title: '', content: '', success: false };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Bạn là một biên tập viên chuyên nghiệp về thị trường tiền điện tử và blockchain.

Nhiệm vụ: Dịch và viết lại bài viết sau sang tiếng Việt một cách chi tiết, chuyên nghiệp và hấp dẫn.

TIÊU ĐỀ GỐC:
${title}

NỘI DUNG GỐC:
${content}

YÊU CẦU:
1. Dịch tiêu đề sang tiếng Việt ngắn gọn, hấp dẫn, clickbait nhẹ

2. Viết lại nội dung chi tiết sang tiếng Việt (800-1200 từ) với CẤU TRÚC RÕ RÀNG:

   <h2>Tóm Tắt Nhanh</h2>
   <p>Tóm tắt tin chính trong 2-3 câu ngắn gọn</p>

   <h2>Chi Tiết Sự Kiện</h2>
   <p>Diễn giải chi tiết về sự kiện/tin tức chính. Bao gồm các thông tin quan trọng như:</p>
   <ul>
     <li>Điểm nào, khi nào, ai liên quan</li>
     <li>Số liệu cụ thể (nếu có)</li>
     <li>Nguyên nhân và diễn biến</li>
   </ul>

   <h2>Tác Động Đến Thị Trường</h2>
   <p>Phân tích cách sự kiện này ảnh hưởng đến:</p>
   <ul>
     <li>Giá token/coin liên quan</li>
     <li>Tâm lý nhà đầu tư</li>
     <li>Xu hướng giao dịch</li>
   </ul>

   <h2>Ý Kiến Chuyên Gia</h2>
   <p>Trích dẫn và phân tích ý kiến từ các chuyên gia trong bài gốc (nếu có)</p>

   <h2>Bối Cảnh Và Xu Hướng</h2>
   <p>Đặt sự kiện trong bối cảnh rộng hơn của thị trường crypto hiện tại</p>

   <h2>Kết Luận</h2>
   <p>Tóm lược và đưa ra nhận định về triển vọng tương lai</p>

3. Phong cách viết:
   - Chuyên nghiệp nhưng dễ hiểu
   - Tự nhiên như người Việt viết, KHÔNG dịch máy
   - Sử dụng thuật ngữ crypto chính xác
   - Thêm số liệu cụ thể từ bài gốc
   - Dùng <strong> để nhấn mạnh từ khóa quan trọng

4. Định dạng HTML:
   - <h2> cho tiêu đề chính các phần (QUAN TRỌNG!)
   - <h3> cho tiêu đề phụ nếu cần
   - <p> cho đoạn văn
   - <strong> cho nhấn mạnh
   - <ul><li> cho danh sách
   - <blockquote> cho trích dẫn

5. Trả về JSON:
{
  "title": "tiêu đề tiếng Việt",
  "content": "nội dung HTML tiếng Việt đã viết lại với đầy đủ headings"
}

QUAN TRỌNG: 
- Chỉ trả về JSON thuần, không thêm markdown code block hay text khác
- BẮT BUỘC phải có ít nhất 5-6 thẻ <h2> trong content
- Mỗi section phải có content đầy đủ, không viết sơ sài`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response from Gemini');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        console.log('✅ Gemini AI translation successful');
        return {
            title: parsed.title,
            content: parsed.content,
            success: true
        };
    } catch (error: any) {
        console.error('❌ Gemini AI error:', error.message);

        // Check if quota exceeded
        if (error.message?.includes('quota') || error.message?.includes('429')) {
            console.log('⚠️ Gemini quota exceeded, switching to Google Translate');
        }

        return { title: '', content: '', success: false };
    }
}

async function translateWithGoogleTranslate(text: string): Promise<string> {
    try {
        const result = await googleTranslate(text, { to: 'vi' });
        return result.text;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original if translation fails
    }
}

export async function generateAndSaveArticle() {
    try {
        console.log(`📰 Fetching latest articles from CoinDesk...`);

        // Get latest article URLs from CoinDesk homepage
        const articleUrls = await getLatestCoinDeskArticles(10);

        if (articleUrls.length === 0) {
            throw new Error("Không tìm thấy bài viết nào");
        }

        // Pick a random article
        const randomUrl = articleUrls[Math.floor(Math.random() * articleUrls.length)];

        // Check if article already exists
        const existing = await prisma.article.findFirst({
            where: { sourceUrl: randomUrl }
        });

        if (existing) {
            console.log('⚠️ Article already exists, trying another...');
            // Try another article
            const anotherUrl = articleUrls[Math.floor(Math.random() * articleUrls.length)];
            const anotherExisting = await prisma.article.findFirst({
                where: { sourceUrl: anotherUrl }
            });
            if (anotherExisting) {
                console.log('⚠️ All recent articles exist, returning latest');
                return existing;
            }
        }

        // Scrape full article content
        const scrapedArticle = await scrapeCoinDeskArticle(randomUrl);

        if (!scrapedArticle) {
            throw new Error("Không thể crawl nội dung bài viết");
        }

        console.log(`🤖 Processing with Gemini AI: ${scrapedArticle.title}`);

        // Try Gemini AI first for high-quality rewrite
        let titleVi = '';
        let contentVi = '';
        let usedGemini = false;

        const geminiResult = await translateWithGemini(scrapedArticle.title, scrapedArticle.content);

        if (geminiResult.success) {
            titleVi = geminiResult.title;
            contentVi = geminiResult.content;
            usedGemini = true;
            console.log('✅ Using Gemini AI for content generation');
        } else {
            // Fallback to Google Translate
            console.log('🔄 Falling back to Google Translate');
            titleVi = await translateWithGoogleTranslate(scrapedArticle.title);
            
            // Verify translation success - if title matches original or doesn't look Vietnamese-ish
            if (titleVi === scrapedArticle.title) {
                throw new Error("Translation failed: Title returned unchanged");
            }

            // For fallback, use first 2000 chars to avoid translation limits
            const shortContent = scrapedArticle.content.slice(0, 2000);
            contentVi = await translateWithGoogleTranslate(shortContent);
        }


        // Use scraped image instead of fallback
        const image = scrapedArticle.image || FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

        // Create Vietnamese content with translated text
        const content = usedGemini ? `
            <article>
                <div class="prose prose-lg max-w-none">
                    ${contentVi}
                </div>

                <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">
                        <small>Bài viết này được tổng hợp và dịch từ các nguồn bên ngoài. Đọc gốc tại: <a href="${scrapedArticle.url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">CoinDesk</a>.</small>
                    </p>
                </div>
            </article>
        ` : `
            <article>
                <p class="lead text-base sm:text-lg"><strong>${titleVi}</strong></p>
                <div class="my-4">
                    ${contentVi.split('\n\n').map(p => `<p class="mb-4">${p}</p>`).join('')}
                </div>
                
                <h3 class="text-lg sm:text-xl font-bold mt-6 mb-3 dark:text-white">Bối Cảnh Thị Trường</h3>
                <p class="mb-4">Sự phát triển này diễn ra vào thời điểm quan trọng đối với thị trường tiền điện tử. Các nhà phân tích đề nghị theo dõi các token liên quan để biết khả năng biến động.</p>

                <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">
                        <small>Bài viết này được tổng hợp và dịch từ các nguồn bên ngoài. Đọc gốc tại: <a href="${scrapedArticle.url}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">CoinDesk</a>.</small>
                    </p>
                </div>
            </article>
        `;

        // Strip HTML tags from content for summary
        const stripHtml = (html: string) => {
            return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        };
        const summaryVi = stripHtml(contentVi).slice(0, 200) + "...";

        const article = await prisma.article.create({
            data: {
                title: titleVi,
                summary: summaryVi,
                content: content,
                image: image,
                author: "Tường An",
                source: "CoinDesk",
                sourceUrl: scrapedArticle.url,
                isPublished: true,
                date: scrapedArticle.publishedDate
            }
        });

        console.log(`✅ Article created: ${article.title} (${usedGemini ? 'Gemini AI' : 'Google Translate'})`);
        return article;

    } catch (error) {
        console.error("Failed to generate article:", error);
        throw error;
    }
}
