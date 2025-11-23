/**
 * Convert Vietnamese text to URL-friendly slug
 */
export function slugify(text: string): string {
  // Convert to lowercase
  let slug = text.toLowerCase();

  // Replace Vietnamese characters
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
    // Remove trailing incomplete word
    const lastHyphen = slug.lastIndexOf('-');
    if (lastHyphen > 0) {
      slug = slug.substring(0, lastHyphen);
    }
  }

  return slug || 'article'; // Fallback if slug is empty
}

/**
 * Generate article URL with slug and id
 */
export function generateArticleUrl(title: string, id: string): string {
  const slug = slugify(title);
  return `/article/${slug}?id=${id}`;
}

