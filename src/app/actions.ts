'use server';

import { generateAndSaveArticle } from '@/lib/auto-generator';
import { revalidatePath } from 'next/cache';

export async function triggerAutoGenerate() {
    try {
        const article = await generateAndSaveArticle();
        revalidatePath('/');
        return { success: true, message: 'Bài viết mới đã được tạo và xuất bản!' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Không thể tạo bài viết. Vui lòng thử lại.' };
    }
}
