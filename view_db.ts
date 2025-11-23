import { prisma } from './src/lib/prisma';

async function viewDatabase() {
    console.log("📊 DATABASE OVERVIEW\n");
    
    // Count articles
    const totalArticles = await prisma.article.count();
    console.log(`Total Articles: ${totalArticles}\n`);
    
    // Get all articles
    const articles = await prisma.article.findMany({
        orderBy: { date: 'desc' },
        take: 20
    });
    
    console.log("📰 RECENT ARTICLES:\n");
    console.log("=" .repeat(100));
    
    articles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   ID: ${article.id}`);
        console.log(`   Slug: ${article.slug || 'N/A'}`);
        console.log(`   Author: ${article.author}`);
        console.log(`   Source: ${article.source}`);
        console.log(`   Published: ${article.date.toLocaleString('vi-VN')}`);
        console.log(`   Summary: ${article.summary?.slice(0, 100)}...`);
        console.log(`   Tags: ${article.tags || 'N/A'}`);
        console.log(`   Image: ${article.image?.slice(0, 60)}...`);
        console.log(`   Status: ${article.isPublished ? '✅ Published' : '❌ Draft'}`);
        console.log("-".repeat(100));
    });
    
    console.log("\n✅ Done!");
}

viewDatabase()
    .catch(e => console.error('❌ Error:', e))
    .finally(async () => await prisma.$disconnect());

