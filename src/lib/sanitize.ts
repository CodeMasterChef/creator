import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags while removing potentially dangerous content
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span',
            'table', 'thead', 'tbody', 'tr', 'td', 'th', 'code', 'pre',
            'article', 'section', 'small'
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class', 'target', 'rel',
            'width', 'height', 'style'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        ADD_ATTR: ['target'],
        ALLOW_DATA_ATTR: false,
        FORCE_BODY: false,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,

        SANITIZE_DOM: true,
        KEEP_CONTENT: true,
    });
}

/**
 * Sanitize article content specifically
 * More permissive for rich article content
 */
export function sanitizeArticleContent(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'i', 'b',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote', 'q', 'cite',
            'a', 'img',
            'div', 'span', 'article', 'section',
            'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
            'code', 'pre', 'kbd', 'samp',
            'small', 'mark', 'del', 'ins', 'sub', 'sup',
            'hr', 'figure', 'figcaption'
        ],
        ALLOWED_ATTR: [
            'href', 'src', 'alt', 'title', 'class', 'target', 'rel',
            'width', 'height', 'style', 'id', 'name'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        ADD_ATTR: ['target', 'rel'],
        ALLOW_DATA_ATTR: false,
        SANITIZE_DOM: true,
        KEEP_CONTENT: true,
    });
}


