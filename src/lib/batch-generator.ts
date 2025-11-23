import { generateAndSaveArticle } from './auto-generator';

/**
 * Generate multiple articles in batch
 * This helps populate the database faster
 */
export async function generateMultipleArticles(count: number = 5) {
    console.log(`🚀 Starting batch generation of ${count} articles...`);
    
    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
    };

    for (let i = 0; i < count; i++) {
        try {
            console.log(`\n📝 Generating article ${i + 1}/${count}...`);
            await generateAndSaveArticle();
            results.success++;
            console.log(`✅ Article ${i + 1}/${count} created successfully`);
            
            // Add a small delay between requests to avoid rate limiting
            if (i < count - 1) {
                console.log('⏳ Waiting 5 seconds before next article...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } catch (error: any) {
            results.failed++;
            results.errors.push(`Article ${i + 1}: ${error.message}`);
            console.error(`❌ Failed to generate article ${i + 1}:`, error.message);
            
            // Continue with next article even if one fails
            continue;
        }
    }

    console.log('\n📊 Batch Generation Complete:');
    console.log(`   ✅ Success: ${results.success}`);
    console.log(`   ❌ Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(err => console.log(`   - ${err}`));
    }

    return results;
}

