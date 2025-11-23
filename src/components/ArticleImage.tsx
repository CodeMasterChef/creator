'use client';

interface ArticleImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ArticleImage({ src, alt, className = '', style }: ArticleImageProps) {
  return (
    <img 
      src={src} 
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}

