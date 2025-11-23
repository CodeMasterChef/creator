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
        title: `${article.title} | CryptoPulse`,
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
        <article className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Tin Tức
                </span>
                <h1 style={{ fontSize: '3rem', marginTop: '1rem', lineHeight: '1.1' }}>{article.title}</h1>
                <div className="text-gray" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <span>Bởi {article.author}</span>
                    <span>•</span>
                    <time>{format(new Date(article.date), "d MMMM, yyyy", { locale: vi })}</time>
                </div>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', marginBottom: '3rem' }}>
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
            </div>

            <div
                className="article-content"
                style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Về Tác Giả</h3>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold' }}>
                        AI
                    </div>
                    <div>
                        <p style={{ fontWeight: 'bold' }}>{article.author}</p>
                        <p className="text-sm text-gray">Chuyên Gia Phân Tích Thị Trường Tự Động</p>
                    </div>
                </div>
            </div>
        </article>
    );
}
