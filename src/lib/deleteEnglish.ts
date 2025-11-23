// Delete all articles whose title is still in English (no Vietnamese characters)
// Run this script manually when you want to clean the DB.

import { prisma } from '@/lib/prisma';
import { translateWithGemini } from './auto-generator'; // not needed but kept for import consistency
import { translateWithGoogleTranslate } from './auto-generator'; // not needed

export async function deleteEnglishArticles() {
    try {
        // Find articles where title does NOT contain any Vietnamese diacritic characters
        const englishArticles = await prisma.article.findMany({
            where: {
                NOT: {
                    title: {
                        // Regex to match Vietnamese characters; using Prisma's contains with mode insensitive is limited, so we use raw query via $queryRaw
                        // We'll filter in JS after fetching all titles (assuming not huge dataset)
                    },
                },
            },
        });

        // Filter in JS for titles without Vietnamese characters
        const toDelete = englishArticles.filter((a) => !/[\u0102-\u01B0\u1EA0-\u1EF9]/.test(a.title));
        console.log(`🗑️ Found ${toDelete.length} English‑only articles to delete.`);

        for (const article of toDelete) {
            await prisma.article.delete({ where: { id: article.id } });
            console.log(`✅ Deleted article id=${article.id}`);
        }
        console.log('🧹 Deletion completed.');
    } catch (error) {
        console.error('❌ Error during deletion:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute if run directly
if (require.main === module) {
    deleteEnglishArticles()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
