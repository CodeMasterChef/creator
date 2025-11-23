import Parser from 'rss-parser';
import { prisma } from './prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLatestCoinDeskArticles, scrapeCoinDeskArticle } from './scraper';
import { slugify } from './slugify';

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
        throw new Error('⚠️ Gemini API key not found. Please set GEMINI_API_KEY in .env file');
    }

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

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

        // Try to extract and parse JSON from response
        let parsed;
        try {
            // First, try to find JSON block
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            // Clean up common JSON issues
            let jsonStr = jsonMatch[0];
            
            // Remove trailing commas before closing braces/brackets
            jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            
            // Fix unescaped quotes in strings (basic fix)
            // This is a simple approach - may need more sophisticated handling
            
            parsed = JSON.parse(jsonStr);
            
            if (!parsed.title || !parsed.content) {
                throw new Error('Missing title or content in JSON');
            }
        } catch (parseError: any) {
            console.error('JSON Parse Error:', parseError.message);
            console.error('Response preview:', response.substring(0, 500));
            throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
        }

        console.log('✅ Gemini AI translation successful');
        return {
            title: parsed.title,
            content: parsed.content,
            success: true
        };
    } catch (error: any) {
        console.error('❌ Gemini AI error:', error.message);
        throw error; // Re-throw error instead of falling back
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

        // Use Gemini AI for high-quality translation and rewrite
        const geminiResult = await translateWithGemini(scrapedArticle.title, scrapedArticle.content);

        if (!geminiResult.success) {
            throw new Error("Gemini AI translation failed");
        }

        const titleVi = geminiResult.title;
        const contentVi = geminiResult.content;
        console.log('✅ Gemini AI translation successful');


        // Use scraped image instead of fallback
        const image = scrapedArticle.image || FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

        // Create Vietnamese content with Gemini-generated text
        const content = `
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
        `;

        // Strip HTML tags from content for summary
        const stripHtml = (html: string) => {
            return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        };
        const summaryVi = stripHtml(contentVi).slice(0, 200) + "...";

        // Extract potential tags from title
        const extractTags = (title: string): string => {
            const keywords = ['Bitcoin', 'Ethereum', 'BTC', 'ETH', 'DeFi', 'NFT', 'Crypto', 'Blockchain', 'Web3', 'Altcoin'];
            const foundTags = keywords.filter(keyword => 
                title.toLowerCase().includes(keyword.toLowerCase())
            );
            return foundTags.join(', ');
        };

        const article = await prisma.article.create({
            data: {
                title: titleVi,
                slug: slugify(titleVi),
                summary: summaryVi,
                content: content,
                image: image,
                tags: extractTags(titleVi),
                author: "Tường An",
                source: "CoinDesk",
                sourceUrl: scrapedArticle.url,
                isPublished: true,
                date: scrapedArticle.publishedDate
            }
        });

        console.log(`✅ Article created: ${article.title} (Gemini AI)`);
        return article;

    } catch (error) {
        console.error("Failed to generate article:", error);
        throw error;
    }
}
