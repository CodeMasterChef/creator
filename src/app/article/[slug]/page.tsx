import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import ArticleAdminActions from "@/components/ArticleAdminActions";
import { sanitizeArticleContent } from "@/lib/sanitize";
import { generateArticleUrl } from "@/lib/slugify";
import * as cheerio from "cheerio";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ id?: string }>;
}

async function getArticleById(id: string) {
    return prisma.article.findUnique({ where: { id } });
}

async function getArticleBySlug(slug: string) {
    return prisma.article.findUnique({ where: { slug } });
}

// Remove existing source attribution blocks and keep the rest intact
function stripSourceAttribution(html: string): string {
    try {
        const $ = cheerio.load(html, null, false);
        const phrases = [
            'Bài viết này được tổng hợp',
            'Đọc gốc tại',
            'Đọc bài gốc',
            'Nguồn:'
        ];

        ['p', 'small', 'em', 'div'].forEach(selector => {
            $(selector).each((_, element) => {
                const text = $(element).text();
                if (phrases.some(phrase => text.includes(phrase))) {
                    $(element).remove();
                }
            });
        });

        return $.root().html()?.trim() || '';
    } catch (error) {
        console.error('stripSourceAttribution failed', error);
        return html;
    }
}

// Remove inline font declarations to align with site typography
function normalizeArticleFonts(html: string): string {
    try {
        const $ = cheerio.load(html, null, false);
        $('[style]').each((_, element) => {
            const styleAttr = $(element).attr('style');
            if (!styleAttr) return;

            const declarations = styleAttr
                .split(';')
                .map(decl => decl.trim())
                .filter(Boolean);

            const filtered = declarations.filter(decl => {
                const [prop] = decl.split(':');
                if (!prop) return false;
                const property = prop.trim().toLowerCase();
                return property !== 'font-family' && property !== 'font';
            });

            if (filtered.length === 0) {
                $(element).removeAttr('style');
            } else {
                $(element).attr('style', filtered.join('; '));
            }
        });

        return $.root().html() || '';
    } catch (error) {
        console.error('normalizeArticleFonts failed', error);
        return html;
    }
}

// Extract tags from article title and content
function extractTags(title: string, content: string): string[] {
    const text = (title + ' ' + content).toLowerCase();
    const tagKeywords: Record<string, string[]> = {
        'Bitcoin': ['bitcoin', 'btc'],
        'Ethereum': ['ethereum', 'eth', 'ether'],
        'XRP': ['xrp', 'ripple'],
        'Thị trường': ['market', 'thị trường', 'trading', 'giao dịch'],
        'DeFi': ['defi', 'decentralized finance'],
        'NFT': ['nft', 'non-fungible'],
        'Blockchain': ['blockchain', 'chuỗi khối'],
        'Altcoin': ['altcoin', 'alt coin'],
        'Mining': ['mining', 'khai thác'],
        'Stablecoin': ['stablecoin', 'usdt', 'usdc'],
        'Web3': ['web3', 'web 3'],
        'DAO': ['dao', 'decentralized autonomous'],
        'Metaverse': ['metaverse', 'vũ trụ ảo'],
        'Regulation': ['regulation', 'quy định', 'sec', 'cftc'],
        'Investment': ['investment', 'đầu tư', 'fund', 'etf'],
    };

    const foundTags: string[] = [];
    for (const [tag, keywords] of Object.entries(tagKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            foundTags.push(tag);
        }
    }

    return foundTags.slice(0, 6); // Maximum 6 tags
}

async function getRelatedArticles(currentId: string, tags: string[]) {
    const baseWhere: Prisma.ArticleWhereInput = {
        isPublished: true,
        id: { not: currentId },
    };

    const taggedWhere: Prisma.ArticleWhereInput = tags.length
        ? {
            ...baseWhere,
            OR: tags.map(tag => ({
                tags: { contains: tag },
            })),
        }
        : baseWhere;

    const related = await prisma.article.findMany({
        where: taggedWhere,
        orderBy: { date: "desc" },
        take: 4,
    });

    if (related.length > 0 || tags.length === 0) return related;

    // Fallback: newest articles
    return prisma.article.findMany({
        where: baseWhere,
        orderBy: { date: "desc" },
        take: 4,
    });
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { id } = await searchParams;
    const { slug } = await params;

    const article = id
        ? await getArticleById(id)
        : await getArticleBySlug(slug);

    if (!article) return { title: "Không tìm thấy" };

    return {
        title: `${article.title} | Thư Viện Tiền Số`,
        description: article.summary,
        openGraph: {
            title: article.title,
            description: article.summary,
            images: [article.image],
            type: "article",
            publishedTime: article.date.toISOString(),
            authors: [article.author],
        },
    };
}

export default async function ArticlePage({ params, searchParams }: Props) {
    const { id } = await searchParams;
    const { slug } = await params;

    const article = id
        ? await getArticleById(id)
        : await getArticleBySlug(slug);

    if (!article) notFound();

    // Check if user is admin
    const session = await auth();
    const isAdmin = !!session;

    const cleanedContent = stripSourceAttribution(article.content).trim();
    const displayContent = cleanedContent || article.content;
    const sanitizedContent = sanitizeArticleContent(displayContent);
    const normalizedContent = normalizeArticleFonts(sanitizedContent);

    // Extract tags from article
    const tags = extractTags(article.title, article.content);

    // Get related articles
    const relatedArticles = await getRelatedArticles(article.id, tags);

    // Get category mapping for links
    const categoryMapping: Record<string, string> = {
        'Bitcoin': 'bitcoin',
        'Ethereum': 'ethereum',
        'XRP': 'xrp',
        'Thị trường': 'market',
        'DeFi': 'market',
        'NFT': 'market',
        'Blockchain': 'market',
        'Altcoin': 'market',
        'Mining': 'market',
        'Stablecoin': 'market',
        'Web3': 'market',
        'DAO': 'market',
        'Metaverse': 'market',
        'Regulation': 'market',
        'Investment': 'market',
    };

    return (
        <article className="animate-fade-in w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }} className="sm:mb-8">
                <span className="text-xs sm:text-sm" style={{ color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Tin Tức
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl dark:text-white" style={{ marginTop: '0.75rem', lineHeight: '1.1', fontWeight: 'bold' }}>{article.title}</h1>
                {article.summary && (
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-4 sm:mt-6 max-w-3xl mx-auto leading-relaxed" style={{ fontStyle: 'italic' }}>
                        {article.summary}
                    </p>
                )}
                <div className="text-gray text-xs sm:text-sm" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>Biên tập: {article.author}</span>
                    <span className="hidden sm:inline">•</span>
                    <time>{format(new Date(article.date), "d MMMM, yyyy", { locale: vi })}</time>
                </div>
                
                {/* Admin Actions */}
                {isAdmin && (
                    <ArticleAdminActions 
                        article={{
                            id: article.id,
                            title: article.title,
                            slug: article.slug || article.id,
                            content: article.content,
                            image: article.image,
                            tags: article.tags,
                            isPublished: article.isPublished
                        }}
                    />
                )}
            </div>

            <div
                className="relative w-full rounded-lg sm:rounded-xl overflow-hidden mb-6 sm:mb-8 lg:mb-12 bg-gray-900/20 dark:bg-gray-800/40"
                style={{ aspectRatio: "16 / 9" }}
            >
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                />
            </div>

            <div
                className="article-content text-base sm:text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: normalizedContent }}
            />

            {/* Source Attribution - Always visible, link only for admin */}
            <div className="mt-8 sm:mt-10">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic">
                    Bài viết này được tổng hợp và dịch từ các nguồn bên ngoài.
                    {isAdmin && article.sourceUrl && (
                        <>
                            {' '}Đọc gốc tại:{' '}
                            <a
                                href={article.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-medium"
                            >
                                {article.source || 'Nguồn gốc'}
                            </a>
                        </>
                    )}
                </p>
            </div>

            {/* Tags Section */}
            {tags.length > 0 && (
                <div className="mt-8 sm:mt-10 lg:mt-12">
                    <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 dark:text-white">Chủ đề liên quan</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/?category=${categoryMapping[tag] || 'all'}`}
                                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold rounded-full transition-all hover:shadow-md"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {relatedArticles.length > 0 && (
                <div className="mt-10 sm:mt-12 lg:mt-14">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-xl font-bold dark:text-white">Đọc tiếp</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Gợi ý bài liên quan</span>
                    </div>
                    <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
                        {relatedArticles.map((related) => (
                            <Link
                                key={related.id}
                                href={generateArticleUrl(related.title, related.id)}
                                className="group bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-transparent hover:border-primary/40 transition-all shadow-sm hover:shadow-md overflow-hidden"
                            >
                                <div className="relative w-full aspect-[16/9] bg-gray-200/60 dark:bg-gray-900">
                                    {related.image && (
                                        <Image
                                            src={related.image}
                                            alt={related.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    )}
                                </div>
                                <div className="p-3 space-y-1.5">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(related.date), "d MMMM, yyyy", { locale: vi })}
                                    </p>
                                    <p className="font-semibold text-sm sm:text-base dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                                        {related.title}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 dark:text-white">Về Biên Tập Viên</h3>
                <div className="card bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-primary/20">
                        <Image
                            src="/tuong-an-avatar.jpg?v=2"
                            alt="Tường An"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div>
                        <p className="font-bold text-base sm:text-lg dark:text-white">Tường An</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Biên tập viên tin tức tại Thư Viện Tiền Số</p>
                    </div>
                </div>
            </div>
        </article>
    );
}
