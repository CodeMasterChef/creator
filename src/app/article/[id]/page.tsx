import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ id: string }>;
}

async function getArticle(id: string) {
    const article = await prisma.article.findUnique({
        where: { id }
    });
    return article;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
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

export default async function ArticlePage({ params }: Props) {
    const { id } = await params;
    const article = await getArticle(id);

    if (!article) {
        notFound();
    }

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

            <div className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 dark:text-white">Về Biên Tập Viên</h3>
                <div className="card bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-primary/20">
                        <Image
                            src="/tuong-an-avatar.jpg"
                            alt="Tường An"
                            fill
                            className="object-cover"
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
