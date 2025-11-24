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

export async function translateWithGemini(title: string, content: string): Promise<{ title: string; content: string; success: boolean }> {
    if (!genAI) {
        throw new Error('⚠️ Gemini API key not found. Please set GEMINI_API_KEY in .env file');
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",  // Latest experimental model with improved capabilities
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
            },
        });

        const prompt = `Bạn là một biên tập viên chuyên nghiệp về thị trường tiền điện tử và blockchain.

Nhiệm vụ: Dịch và viết lại bài viết sau sang tiếng Việt một cách TỰ NHIÊN, chuyên nghiệp và hấp dẫn.

TIÊU ĐỀ GỐC:
${title}

NỘI DUNG GỐC:
${content}

YÊU CẦU:

1. **Dịch tiêu đề**: Sang tiếng Việt ngắn gọn, hấp dẫn, giữ ý nghĩa gốc

2. **Viết lại nội dung** (800-1200 từ):
   - QUAN TRỌNG: Giữ nguyên BỐ CỤC và CẤU TRÚC của bài gốc
   - Dịch và mở rộng các phần theo thứ tự của bài nguồn
   - Nếu bài gốc có 3 phần thì viết 3 phần, có 5 phần thì viết 5 phần
   - KHÔNG tự ý thêm sections hoặc thay đổi cấu trúc
   - Chỉ dịch và làm phong phú thêm nội dung đã có
   - BẮT ĐẦU NGAY VỚI NỘI DUNG, không viết lại tiêu đề dưới dạng heading
   - Heading đầu tiên phải là phần nội dung chính, KHÔNG phải nhắc lại title

3. **Phong cách viết**:
   - Tự nhiên như người Việt viết, KHÔNG giống AI template
   - Chuyên nghiệp nhưng dễ hiểu, không rườm rà
   - Giữ nguyên tone và style của bài gốc
   - Sử dụng thuật ngữ crypto chính xác
   - Giữ nguyên số liệu, tên người, tên công ty từ bài gốc

4. **Định dạng HTML** (QUAN TRỌNG):
   - <h2> cho các tiêu đề chính (theo bài gốc)
   - <h3> cho tiêu đề phụ (nếu bài gốc có)
   - <p> cho đoạn văn
   - <strong> để in đậm từ khóa quan trọng (VÍ DỤ: <strong>quá bán</strong>)
   - <ul><li> cho danh sách (nếu phù hợp)
   - <blockquote> cho trích dẫn (nếu có)
   - TUYỆT ĐỐI KHÔNG dùng markdown ** hay __ cho in đậm, chỉ dùng <strong>

5. **Trả về JSON**:
{
  "title": "tiêu đề tiếng Việt",
  "content": "nội dung HTML tiếng Việt với cấu trúc tự nhiên theo bài gốc"
}

QUAN TRỌNG: 
- Chỉ trả về JSON thuần, không thêm markdown code block
- Phải có ít nhất 2-3 thẻ <h2> trong content (tùy theo bài gốc)
- GIỮ NGUYÊN bố cục của bài gốc, KHÔNG ép theo template
- Viết tự nhiên, không rập khuôn
- KHÔNG nhắc lại tiêu đề trong heading đầu tiên của content
- Content phải bắt đầu ngay bằng phần nội dung chính hoặc đoạn giới thiệu
- KHÔNG dùng dấu ngoặc kép (") trong content, thay bằng dấu nháy đơn (')
- In đậm phải dùng <strong>text</strong>, KHÔNG DÙNG **text**
- Escape tất cả ký tự đặc biệt trong JSON`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Try to extract and parse JSON from response
        let parsed;
        try {
            // First, try direct JSON parsing (for JSON mode)
            try {
                parsed = JSON.parse(response);
            } catch {
                // If direct parsing fails, try to extract JSON from text
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('No JSON found in response');
                }

                let jsonStr = jsonMatch[0];

                // Advanced JSON cleaning
                // 1. Remove trailing commas before closing braces/brackets
                jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

                // 2. Fix common issues with quotes in Vietnamese text
                // Replace problematic characters that might break JSON
                jsonStr = jsonStr.replace(/[\u2018\u2019]/g, "'"); // Smart quotes to regular quotes
                jsonStr = jsonStr.replace(/[\u201C\u201D]/g, '"'); // Smart double quotes

                // 3. Try parsing with cleaned string
                try {
                    parsed = JSON.parse(jsonStr);
                } catch (e2) {
                    // Last resort: try to extract just title and content fields
                    const titleMatch = jsonStr.match(/"title"\s*:\s*"([^"]+(?:\\.[^"]*)*)"/);
                    const contentMatch = jsonStr.match(/"content"\s*:\s*"([\s\S]*?)"\s*}/);

                    if (titleMatch && contentMatch) {
                        parsed = {
                            title: titleMatch[1].replace(/\\"/g, '"'),
                            content: contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
                        };
                    } else {
                        throw e2;
                    }
                }
            }

            if (!parsed.title || !parsed.content) {
                throw new Error('Missing title or content in JSON');
            }
        } catch (parseError: any) {
            console.error('JSON Parse Error:', parseError.message);
            console.error('Response preview:', response.substring(0, 1000));
            console.error('Response full length:', response.length);
            throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
        }

        // Convert markdown bold to HTML strong (in case AI still uses markdown)
        let cleanedContent = parsed.content;

        // Convert **text** to <strong>text</strong>
        cleanedContent = cleanedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Convert __text__ to <strong>text</strong>
        cleanedContent = cleanedContent.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // Remove first heading if it's too similar to title (to avoid duplication)
        const firstHeadingMatch = cleanedContent.match(/<h2[^>]*>(.*?)<\/h2>/i);
        if (firstHeadingMatch) {
            const firstHeading = firstHeadingMatch[1].replace(/<[^>]+>/g, '').trim();
            const titleText = parsed.title.replace(/<[^>]+>/g, '').trim();

            // Check similarity (simple approach: if heading contains 70% of title words)
            const titleWords = titleText.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
            const headingWords = firstHeading.toLowerCase().split(/\s+/);
            const matchCount = titleWords.filter((word: string) => headingWords.some((hw: string) => hw.includes(word))).length;
            const similarity = matchCount / Math.max(titleWords.length, 1);

            // If similarity > 0.6 (60%), remove the first heading
            if (similarity > 0.6) {
                console.log(`🔧 Removing duplicate first heading: "${firstHeading}"`);
                cleanedContent = cleanedContent.replace(/<h2[^>]*>.*?<\/h2>/i, '').trim();
            }
        }

        console.log('✅ Gemini AI translation successful');
        return {
            title: parsed.title,
            content: cleanedContent,
            success: true
        };
    } catch (error: any) {
        console.error('❌ Gemini AI error:', error.message);
        throw error; // Re-throw error instead of falling back
    }
}

export async function generateAndSaveArticle() {
    const startTime = Date.now();
    let logId: string | null = null;

    try {
        // Create generation log entry
        const log = await prisma.generationLog.create({
            data: {
                status: 'running',
                startedAt: new Date()
            }
        });
        logId = log.id;

        console.log(`📰 Fetching latest articles from CoinDesk...`);

        // Get more article URLs from CoinDesk homepage (increased from 10 to 50)
        const articleUrls = await getLatestCoinDeskArticles(50);

        if (articleUrls.length === 0) {
            throw new Error("Không tìm thấy bài viết nào");
        }

        // Get all existing article URLs to avoid duplicates
        const existingArticles = await prisma.article.findMany({
            select: { sourceUrl: true }
        });
        const existingUrls = new Set(existingArticles.map(a => a.sourceUrl));

        // Filter out articles that already exist
        const newUrls = articleUrls.filter(url => !existingUrls.has(url));

        if (newUrls.length === 0) {
            console.log('⚠️ All recent articles already exist in database');
            const latest = await prisma.article.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            return latest!;
        }

        console.log(`✅ Found ${newUrls.length} new articles to process`);

        // Pick a random new article
        const randomUrl = newUrls[Math.floor(Math.random() * newUrls.length)];

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
        // Note: Source link is now displayed separately in article page (only for admin)
        const content = `
            <article>
                <div class="prose prose-lg max-w-none">
                    ${contentVi}
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

        // Update log with success
        if (logId) {
            const duration = Date.now() - startTime;
            await prisma.generationLog.update({
                where: { id: logId },
                data: {
                    status: 'success',
                    articlesCreated: 1,
                    completedAt: new Date(),
                    duration
                }
            });
        }

        return article;

    } catch (error) {
        console.error("Failed to generate article:", error);

        // Update log with failure
        if (logId) {
            const duration = Date.now() - startTime;
            await prisma.generationLog.update({
                where: { id: logId },
                data: {
                    status: 'failed',
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    errorDetails: error instanceof Error ? error.stack : String(error),
                    completedAt: new Date(),
                    duration
                }
            });
        }

        throw error;
    }
}
