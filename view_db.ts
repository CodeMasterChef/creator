import { prisma } from './src/lib/prisma';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgYellow: '\x1b[43m',
    bold: '\x1b[1m',
};

async function viewDatabase() {
    console.log("📊 DATABASE OVERVIEW\n");
    
    // Count articles
    const totalArticles = await prisma.article.count();
    console.log(`Total Articles: ${totalArticles}\n`);
    
    // Get all articles
    const articles = await prisma.article.findMany({
        orderBy: { date: 'desc' }
    });
    
    // Check for duplicate images
    const imageMap = new Map<string, string[]>(); // image URL -> article IDs
    articles.forEach(article => {
        const existingIds = imageMap.get(article.image) || [];
        imageMap.set(article.image, [...existingIds, article.id]);
    });
    
    // Find duplicates
    const duplicateImages = new Map<string, string[]>();
    imageMap.forEach((ids, imageUrl) => {
        if (ids.length > 1) {
            duplicateImages.set(imageUrl, ids);
        }
    });
    
    // Display duplicate summary
    if (duplicateImages.size > 0) {
        console.log(`${colors.bgRed}${colors.white}${colors.bold} ⚠️  DUPLICATE IMAGES DETECTED ${colors.reset}\n`);
        console.log(`${colors.red}${colors.bold}Found ${duplicateImages.size} duplicate images affecting ${Array.from(duplicateImages.values()).flat().length} articles:${colors.reset}\n`);
        
        let duplicateCount = 0;
        duplicateImages.forEach((ids, imageUrl) => {
            duplicateCount += ids.length;
            console.log(`${colors.yellow}📷 Image: ${imageUrl.slice(0, 70)}...${colors.reset}`);
            console.log(`   ${colors.red}Used by ${ids.length} articles: ${ids.join(', ')}${colors.reset}\n`);
        });
        
        console.log(`${colors.red}${colors.bold}Total duplicate articles: ${duplicateCount}${colors.reset}\n`);
        console.log("=".repeat(100) + "\n");
    } else {
        console.log(`${colors.green}✅ No duplicate images found!${colors.reset}\n`);
        console.log("=".repeat(100) + "\n");
    }
    
    // Display articles
    console.log("📰 ALL ARTICLES:\n");
    console.log("=".repeat(100));
    
    const duplicateArticleIds = new Set(Array.from(duplicateImages.values()).flat());
    
    articles.forEach((article, index) => {
        const isDuplicate = duplicateArticleIds.has(article.id);
        const prefix = isDuplicate ? `${colors.bgYellow}${colors.red}${colors.bold}` : '';
        const suffix = isDuplicate ? colors.reset : '';
        const marker = isDuplicate ? '🔴 DUPLICATE ' : '';
        
        console.log(`${prefix}\n${marker}${index + 1}. ${article.title}${suffix}`);
        console.log(`${prefix}   ID: ${article.id}${suffix}`);
        console.log(`${prefix}   Slug: ${article.slug || 'N/A'}${suffix}`);
        console.log(`${prefix}   Author: ${article.author}${suffix}`);
        console.log(`${prefix}   Source: ${article.source}${suffix}`);
        console.log(`${prefix}   Published: ${article.date.toLocaleString('vi-VN')}${suffix}`);
        console.log(`${prefix}   Summary: ${article.summary?.slice(0, 100)}...${suffix}`);
        console.log(`${prefix}   Tags: ${article.tags || 'N/A'}${suffix}`);
        console.log(`${prefix}   Image: ${article.image?.slice(0, 60)}...${suffix}`);
        console.log(`${prefix}   Status: ${article.isPublished ? '✅ Published' : '❌ Draft'}${suffix}`);
        
        if (isDuplicate) {
            const duplicateGroup = Array.from(duplicateImages.entries()).find(([_, ids]) => ids.includes(article.id));
            if (duplicateGroup) {
                const [imageUrl, ids] = duplicateGroup;
                console.log(`${colors.red}   ⚠️  Shares image with: ${ids.filter(id => id !== article.id).join(', ')}${colors.reset}`);
            }
        }
        
        console.log("-".repeat(100));
    });
    
    console.log("\n✅ Done!");
}

viewDatabase()
    .catch(e => console.error('❌ Error:', e))
    .finally(async () => await prisma.$disconnect());

