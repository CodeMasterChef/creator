import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedArticle {
    title: string;
    content: string;
    image: string;
    author: string;
    publishedDate: Date;
    url: string;
}

export async function scrapeCoinDeskArticle(url: string): Promise<ScrapedArticle | null> {
    try {
        console.log(`🔍 Scraping article: ${url}`);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Extract title
        const title = $('h1').first().text().trim() ||
            $('meta[property="og:title"]').attr('content') ||
            '';

        // Extract featured image
        const image = $('meta[property="og:image"]').attr('content') ||
            $('article img').first().attr('src') ||
            $('img[class*="featured"]').first().attr('src') ||
            '';

        // Extract author
        const author = $('meta[name="author"]').attr('content') ||
            $('a[rel="author"]').first().text().trim() ||
            $('[class*="author"]').first().text().trim() ||
            'CoinDesk';

        // Extract publish date
        const dateStr = $('meta[property="article:published_time"]').attr('content') ||
            $('time').first().attr('datetime') ||
            new Date().toISOString();
        const publishedDate = new Date(dateStr);

        // Extract main content - try multiple selectors
        let content = '';

        // Try article body
        const articleBody = $('article .article-body, article .content-body, .article-content, [class*="articleBody"]');
        if (articleBody.length > 0) {
            // Get all paragraphs
            articleBody.find('p').each((_, elem) => {
                const text = $(elem).text().trim();
                if (text && text.length > 20) { // Filter out short/empty paragraphs
                    content += text + '\n\n';
                }
            });
        }

        // Fallback: get all paragraphs in article
        if (!content) {
            $('article p').each((_, elem) => {
                const text = $(elem).text().trim();
                if (text && text.length > 20) {
                    content += text + '\n\n';
                }
            });
        }

        // Final fallback: use meta description
        if (!content) {
            content = $('meta[property="og:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') ||
                '';
        }

        if (!title || !content) {
            console.log('⚠️ Could not extract title or content');
            return null;
        }

        console.log(`✅ Scraped: ${title.slice(0, 50)}...`);

        return {
            title,
            content: content.trim(),
            image: image.startsWith('http') ? image : `https://www.coindesk.com${image}`,
            author,
            publishedDate,
            url
        };

    } catch (error: any) {
        console.error('❌ Scraping error:', error.message);
        return null;
    }
}

export async function getLatestCoinDeskArticles(limit: number = 10): Promise<string[]> {
    try {
        console.log('📰 Fetching latest articles from CoinDesk...');

        const response = await axios.get('https://www.coindesk.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const articleUrls: string[] = [];

        // Find article links - adjust selectors based on CoinDesk's structure
        $('a[href*="/markets/"], a[href*="/business/"], a[href*="/tech/"]').each((_, elem) => {
            const href = $(elem).attr('href');
            if (href && href.includes('/2025/') && !href.includes('#')) {
                const fullUrl = href.startsWith('http') ? href : `https://www.coindesk.com${href}`;
                if (!articleUrls.includes(fullUrl)) {
                    articleUrls.push(fullUrl);
                }
            }
        });

        console.log(`✅ Found ${articleUrls.length} article URLs`);
        return articleUrls.slice(0, limit);

    } catch (error: any) {
        console.error('❌ Error fetching article list:', error.message);
        return [];
    }
}
