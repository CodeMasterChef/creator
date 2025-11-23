import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://your-app.vercel.app';

    // Get all published articles
    const articles = await prisma.article.findMany({
        where: { isPublished: true },
        select: {
            slug: true,
            id: true,
            updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
    });

    const articleUrls = articles.map((article) => ({
        url: `${baseUrl}/article/${article.slug}?id=${article.id}`,
        lastModified: article.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 1,
        },
        {
            url: `${baseUrl}/admin`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.3,
        },
        ...articleUrls,
    ];
}


