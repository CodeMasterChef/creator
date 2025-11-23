// Re‑translate existing article titles to Vietnamese
// Run this script manually when you need to convert English titles to Vietnamese.

import { prisma } from '@/lib/prisma';
import { translateWithGemini } from './auto-generator';

export async function retranslateAllTitles() {
    try {
        const articles = await prisma.article.findMany({
            where: { isPublished: true },
        });

        console.log(`🔄 Starting re‑translation of ${articles.length} titles...`);

        for (const article of articles) {
            // Detect if title already contains Vietnamese characters
            const hasVietnamese = /[\u0102-\u01B0\u1EA0-\u1EF9]/.test(article.title);
            if (hasVietnamese) continue; // skip already translated

            // Try Gemini first
            // Try Gemini first
            try {
                const geminiResult = await translateWithGemini(article.title, article.content ?? '');
                if (geminiResult.success) {
                    const newTitle = geminiResult.title;
                    console.log(`✅ Gemini translated title for article ${article.id}`);

                    await prisma.article.update({
                        where: { id: article.id },
                        data: { title: newTitle },
                    });
                }
            } catch (e) {
                console.log(`❌ Translation failed for article ${article.id}`);
            }
        }

        console.log('✅ Re‑translation completed');
    } catch (error) {
        console.error('❌ Error during re‑translation:', error);
    }
}

// If this file is executed directly, run the function
if (require.main === module) {
    retranslateAllTitles()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
