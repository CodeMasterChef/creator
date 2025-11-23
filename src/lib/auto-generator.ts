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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Bạn là một chuyên gia dịch thuật và viết lại nội dung về thị trường tiền điện tử.

Nhiệm vụ: Dịch và viết lại bài viết sau sang tiếng Việt một cách tự nhiên, chuyên nghiệp và dễ hiểu.

TIÊU ĐỀ GỐC:
${title}

NỘI DUNG GỐC:
${content}

YÊU CẦU:
1. Dịch tiêu đề sang tiếng Việt ngắn gọn, hấp dẫn
2. Viết lại nội dung sang tiếng Việt (khoảng 200-300 từ):
   - Giữ nguyên ý chính
   - Thêm phân tích và ngữ cảnh thị trường
   - Sử dụng ngôn ngữ chuyên nghiệp nhưng dễ hiểu
   - Không dịch máy móc, viết tự nhiên như người Việt
3. Định dạng: Chỉ trả về JSON với format:
{
  "title": "tiêu đề tiếng Việt",
  "content": "nội dung tiếng Việt đã viết lại"
}

QUAN TRỌNG: Chỉ trả về JSON, không thêm markdown hay text khác.`;

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
                <div class="prose prose-lg">
                    ${contentVi}
                </div>
                
                <div class="bg-gray-100 p-4 rounded-lg my-4">
                    <h3 class="text-lg font-bold">Thông Tin Nhanh</h3>
                    <ul class="list-disc pl-5">
                        <li><strong>Nguồn:</strong> CoinDesk</li>
                        <li><strong>Đã xuất bản:</strong> ${scrapedArticle.publishedDate.toLocaleString('vi-VN')}</li>
                        <li><strong>Tác giả:</strong> ${scrapedArticle.author}</li>
                    </ul>
                </div>

                <p><em><small>Bài viết này được viết lại bởi AI từ các nguồn bên ngoài. <a href="${scrapedArticle.url}" target="_blank" class="text-blue-600 hover:underline">Đọc bài gốc</a>.</small></em></p>
            </article>
        ` : `
            <article>
                <p class="lead"><strong>${titleVi}</strong></p>
                <p>${contentVi}</p>
                
                <h2>Bối Cảnh Thị Trường</h2>
                <p>Sự phát triển này diễn ra vào thời điểm quan trọng đối với thị trường tiền điện tử. Các nhà phân tích đề nghị theo dõi các token liên quan để biết khả năng biến động.</p>
                
                <div class="bg-gray-100 p-4 rounded-lg my-4">
                    <h3 class="text-lg font-bold">Thông Tin Nhanh</h3>
                    <ul class="list-disc pl-5">
                        <li><strong>Nguồn:</strong> CoinDesk</li>
                        <li><strong>Đã xuất bản:</strong> ${scrapedArticle.publishedDate.toLocaleString('vi-VN')}</li>
                        <li><strong>Tác giả:</strong> ${scrapedArticle.author}</li>
                    </ul>
                </div>

                <p><em><small>Bài viết này được tổng hợp và dịch tự động từ các nguồn bên ngoài. <a href="${scrapedArticle.url}" target="_blank" class="text-blue-600 hover:underline">Đọc bài gốc</a>.</small></em></p>
            </article>
        `;

        const summaryVi = contentVi.slice(0, 150) + "...";

        const article = await prisma.article.create({
            data: {
                title: titleVi,
                summary: summaryVi,
                content: content,
                image: image,
                author: usedGemini ? "AI Writer (Gemini)" : "AI Aggregator",
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
