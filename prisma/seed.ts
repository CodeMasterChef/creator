import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create default admin user
    const email = process.env.ADMIN_EMAIL || 'admin@thuvientienso.com';
    const password = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password: hashedPassword,
            name: 'Admin',
            role: 'admin'
        }
    });

    console.log('✅ Admin user created/updated:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log('\n⚠️  IMPORTANT: Change the default password immediately!');
}

main()
    .catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
