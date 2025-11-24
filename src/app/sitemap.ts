import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://thuvientienso.vercel.app';

    try {
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
    } catch (error) {
        // If database is not ready or tables don't exist, return basic sitemap
        console.warn('Could not fetch articles for sitemap:', error);
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
        ];
    }
}





