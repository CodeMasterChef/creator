// Re‑translate existing article titles to Vietnamese
// Run this script manually when you need to convert English titles to Vietnamese.

import { prisma } from '@/lib/prisma';
import { translateWithGemini } from './auto-generator';
import { translateWithGoogleTranslate } from './auto-generator';

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
            const geminiResult = await translateWithGemini(article.title, article.content ?? '');
            let newTitle: string;
            if (geminiResult.success) {
                newTitle = geminiResult.title;
                console.log(`✅ Gemini translated title for article ${article.id}`);
            } else {
                // Fallback to Google Translate
                newTitle = await translateWithGoogleTranslate(article.title);
                console.log(`🔄 Google Translate used for article ${article.id}`);
            }

            await prisma.article.update({
                where: { id: article.id },
                data: { title: newTitle },
            });
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
