import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Updating database schema...');
    
    // Add slug and tags columns using raw SQL
    await prisma.$executeRaw`
      PRAGMA foreign_keys=OFF;
      BEGIN TRANSACTION;
      
      CREATE TABLE IF NOT EXISTS "new_Article" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL DEFAULT '',
        "summary" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "image" TEXT NOT NULL,
        "tags" TEXT,
        "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "author" TEXT NOT NULL,
        "source" TEXT,
        "sourceUrl" TEXT,
        "isPublished" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
      
      INSERT INTO "new_Article" SELECT 
        id, title, COALESCE(id, '') as slug, summary, content, image, 
        NULL as tags, date, author, source, sourceUrl, isPublished, 
        createdAt, updatedAt 
      FROM "Article";
      
      DROP TABLE "Article";
      ALTER TABLE "new_Article" RENAME TO "Article";
      
      CREATE UNIQUE INDEX IF NOT EXISTS "Article_slug_key" ON "Article"("slug");
      
      COMMIT;
      PRAGMA foreign_keys=ON;
    `;
    
    console.log('✅ Schema updated successfully!');
    
    // Update slugs for existing articles
    const articles = await prisma.article.findMany();
    console.log(`📝 Updating slugs for ${articles.length} articles...`);
    
    // Slugify function for Vietnamese
    const slugify = (text: string): string => {
      let slug = text.toLowerCase();
      
      // Vietnamese character map
      const vietnameseMap: Record<string, string> = {
        'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
        'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
        'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
        'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
        'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
        'đ': 'd',
      };
      
      // Replace Vietnamese characters
      for (const [vietnamese, latin] of Object.entries(vietnameseMap)) {
        slug = slug.replace(new RegExp(vietnamese, 'g'), latin);
      }
      
      // Remove special characters, keep only alphanumeric and spaces
      slug = slug.replace(/[^a-z0-9\s-]/g, '');
      
      // Replace multiple spaces or hyphens with single hyphen
      slug = slug.replace(/[\s-]+/g, '-');
      
      // Remove leading/trailing hyphens
      slug = slug.replace(/^-+|-+$/g, '');
      
      // Limit length to 60 characters
      if (slug.length > 60) {
        slug = slug.substring(0, 60);
        const lastHyphen = slug.lastIndexOf('-');
        if (lastHyphen > 0) {
          slug = slug.substring(0, lastHyphen);
        }
      }
      
      return slug || 'article';
    };
    
    for (const article of articles) {
      const slug = slugify(article.title);
      
      await prisma.article.update({
        where: { id: article.id },
        data: { slug }
      });
    }
    
    console.log('✅ All articles updated with proper slugs!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

