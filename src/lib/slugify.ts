/**
 * Convert Vietnamese text to URL-friendly slug
 */
export function slugify(text: string): string {
    // Convert to lowercase
    let slug = text.toLowerCase();

    // Replace Vietnamese characters with Latin equivalents
    const vietnameseMap: { [key: string]: string } = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'đ': 'd',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    };

    // Replace Vietnamese characters
    slug = slug.split('').map(char => vietnameseMap[char] || char).join('');

    // Replace special characters and spaces with hyphens
    slug = slug
        .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    // Add random suffix to ensure uniqueness
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const random = Math.random().toString(36).substring(2, 5); // Random 3 chars
    
    // Limit slug length and add unique suffix
    const maxLength = 50;
    if (slug.length > maxLength) {
        slug = slug.substring(0, maxLength).replace(/-+$/, ''); // Remove trailing hyphen
    }
    
    return `${slug}-${timestamp}${random}`;
}

/**
 * Generate article URL with slug and id
 */
export function generateArticleUrl(title: string, id: string): string {
    const slug = slugify(title);
    return `/article/${slug}?id=${id}`;
}
