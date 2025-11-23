/**
 * Manual script to generate multiple articles at once
 * Usage: npx tsx scripts/generate-batch.ts [number]
 * Example: npx tsx scripts/generate-batch.ts 10
 */

import { generateMultipleArticles } from '../src/lib/batch-generator';

const count = parseInt(process.argv[2]) || 5;

console.log(`🎯 Generating ${count} articles...`);

generateMultipleArticles(count)
    .then(results => {
        console.log('\n✅ Batch generation completed!');
        process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
        console.error('\n❌ Batch generation failed:', error);
        process.exit(1);
    });


