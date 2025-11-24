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

export interface FeedArticleSummary {
    url: string;
    title: string;
    summary: string;
    content?: string;
    image?: string;
    author?: string;
    publishedDate?: Date;
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

const YEAR_FILTER = '/2025/';
const COINDESK_RSS_FEEDS = [
    'https://www.coindesk.com/arc/outboundfeeds/rss?output=most-read',
    'https://www.coindesk.com/arc/outboundfeeds/rss?output=top-news',
    'https://www.coindesk.com/arc/outboundfeeds/rss?output=markets',
    'https://www.coindesk.com/arc/outboundfeeds/rss?output=business',
    'https://www.coindesk.com/arc/outboundfeeds/rss?output=tech',
    'https://www.coindesk.com/arc/outboundfeeds/rss/'
];

function extractImageFromHtml(html: string): string | undefined {
    if (!html) return undefined;
    const $ = cheerio.load(html);
    const src = $('img').first().attr('src');
    return src && src.startsWith('http') ? src : undefined;
}

export async function getLatestCoinDeskArticles(limit: number = 10): Promise<FeedArticleSummary[]> {
    const articleMap = new Map<string, FeedArticleSummary>();

    await Promise.all(
        COINDESK_RSS_FEEDS.map(async (feedUrl) => {
            try {
                const response = await axios.get(feedUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                    },
                    timeout: 10000
                });

                const $ = cheerio.load(response.data, { xmlMode: true });
                $('item').each((_, elem) => {
                    const href = $(elem).find('link').first().text().trim();
                    if (href && href.includes(YEAR_FILTER)) {
                        if (!articleMap.has(href)) {
                            const title = $(elem).find('title').first().text().trim();
                            const summary = $(elem).find('description').first().text().trim();
                            const encodedContent = $(elem).find('content\\:encoded').first().text().trim();
                            const author = $(elem).find('dc\\:creator').first().text().trim() ||
                                $(elem).find('author').first().text().trim();
                            const pubDate = $(elem).find('pubDate').first().text().trim();
                            const mediaImage = $(elem).find('media\\:content').attr('url') ||
                                $(elem).find('enclosure').attr('url') ||
                                extractImageFromHtml(encodedContent || summary);

                            articleMap.set(href, {
                                url: href,
                                title: title || 'CoinDesk Article',
                                summary,
                                content: encodedContent || summary,
                                image: mediaImage,
                                author: author || 'CoinDesk',
                                publishedDate: pubDate ? new Date(pubDate) : undefined
                            });
                        }
                    }
                });

                console.log(`✅ RSS feed ${feedUrl} returned ${articleMap.size} total URLs`);
            } catch (error: any) {
                console.error(`❌ Error fetching RSS feed ${feedUrl}:`, error.message);
            }
        })
    );

    const articles = Array.from(articleMap.values());
    if (articles.length === 0) {
        console.warn('⚠️ No article URLs were found from CoinDesk RSS feeds');
    } else if (articles.length < limit) {
        console.log(`ℹ️ Only ${articles.length} unique articles collected; less than requested limit ${limit}`);
    }

    return articles.slice(0, limit);
}
