const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  try {
    // Add slug and tags columns if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Article" ADD COLUMN "slug" TEXT;
    `).catch(() => console.log('Slug column may already exist'));

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Article" ADD COLUMN "tags" TEXT;
    `).catch(() => console.log('Tags column may already exist'));

    // Update existing articles with slugs based on their IDs
    const articles = await prisma.article.findMany();
    
    for (const article of articles) {
      if (!article.slug || article.slug === '') {
        await prisma.article.update({
          where: { id: article.id },
          data: { slug: article.id }
        });
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log(`Updated ${articles.length} articles`);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

