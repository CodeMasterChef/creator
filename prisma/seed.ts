import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'admin@creator.com' },
        update: {},
        create: {
            email: 'admin@creator.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'admin',
        },
    });

    console.log('✅ Admin user created:', user.email);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
