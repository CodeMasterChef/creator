import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ id?: string }>;
}

async function getArticle(id: string) {
    const article = await prisma.article.findUnique({
        where: { id }
    });
    return article;
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { id } = await searchParams;
    if (!id) return { title: "Không tìm thấy" };
    
    const article = await getArticle(id);
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
    
    if (!id) {
        notFound();
    }
    
    const article = await getArticle(id);

    if (!article) {
        notFound();
    }

    // Extract tags from article
    const tags = extractTags(article.title, article.content);

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
                <div className="text-gray text-xs sm:text-sm" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>Biên tập: {article.author}</span>
                    <span className="hidden sm:inline">•</span>
                    <time>{format(new Date(article.date), "d MMMM, yyyy", { locale: vi })}</time>
                </div>
            </div>

            <div className="relative w-full h-48 sm:h-64 lg:h-96 rounded-lg sm:rounded-xl overflow-hidden mb-6 sm:mb-8 lg:mb-12">
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
            </div>

            <div
                className="article-content text-base sm:text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

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
