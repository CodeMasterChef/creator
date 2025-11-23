import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArticleImage } from '@/components/ArticleImage';

interface Article {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: Date;
  author: string;
}

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const category = params.category || 'all';

  const articles: Article[] = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { date: 'desc' },
    take: 20,
  });

  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white">Chưa có bài viết</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">Hãy quay lại sau để đọc tin tức mới nhất</p>
          <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors">
            Tải lại trang
          </Link>
        </div>
      </div>
    );
  }

  // Filter articles by category based on title/content keywords
  const filterByCategory = (articles: Article[], cat: string) => {
    if (cat === 'all') return articles;
    
    const keywords: Record<string, string[]> = {
      bitcoin: ['bitcoin', 'btc'],
      ethereum: ['ethereum', 'eth', 'ether'],
      xrp: ['xrp', 'ripple'],
      market: ['market', 'thị trường', 'trading', 'giao dịch', 'price', 'giá']
    };
    
    const catKeywords = keywords[cat] || [];
    return articles.filter(article => {
      const text = (article.title + ' ' + article.summary).toLowerCase();
      return catKeywords.some(keyword => text.includes(keyword));
    });
  };

  const filteredArticles = filterByCategory(articles, category);
  
  // If no articles match the filter, show empty state
  if (filteredArticles.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 px-4">
        <div className="max-w-7xl mx-auto py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Không tìm thấy bài viết
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Chưa có bài viết nào trong danh mục này. Hãy thử danh mục khác!
          </p>
          <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Xem tất cả bài viết
          </Link>
        </div>
      </div>
    );
  }

  // Get articles for sidebar and main list
  const latest = filteredArticles.slice(0, 6);  // For left sidebar
  const mainArticles = filteredArticles;  // All articles for main section

  // Giả lập sentiment (random cho demo)
  const getSentiment = (idx: number) => {
    const sentiments = ['positive', 'neutral', 'negative'];
    return sentiments[idx % 3];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Main Container - Full width on all devices */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          
          {/* LEFT SIDEBAR - Latest News - Hidden on mobile, shown on lg+ */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 lg:p-6 sticky top-6">
              {/* Header with RSS icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
                    </svg>
                  </div>
                  <h2 className="text-base lg:text-lg font-bold dark:text-white">Tin Mới Nhất</h2>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-sm font-bold text-gray-500 mb-4">Hôm Nay</h3>
                </div>
                
                {latest.map((article, idx) => (
                  <div key={article.id} className="border-b pb-6 last:border-0">
                    {/* Time */}
                    <div className="text-xs text-gray-500 mb-2">
                      {format(new Date(article.date), 'h:mm aa').toUpperCase()}
                    </div>
                    
                    {/* Sentiment Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${
                        getSentiment(idx) === 'positive' ? 'bg-green-500' : 
                        getSentiment(idx) === 'negative' ? 'bg-red-500' : 
                        'bg-gray-400'
                      }`}></span>
                      <span className={`text-xs font-semibold ${
                        getSentiment(idx) === 'positive' ? 'text-green-600' : 
                        getSentiment(idx) === 'negative' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {getSentiment(idx) === 'positive' ? 'Tích cực' : 
                         getSentiment(idx) === 'negative' ? 'Tiêu cực' : 
                         'Trung lập'}
                      </span>
                    </div>
                    
                    {/* Article Link */}
                    <Link href={`/article/${article.id}`} className="group">
                      <h3 className="font-serif text-base font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {article.summary}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT */}
          <main className="lg:col-span-9">
            {/* Featured Stories Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 dark:text-white">Tin Nổi Bật</h1>
              
              {/* Category Tabs - Scrollable on mobile */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <Link href="/?category=all" className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
                  category === 'all' 
                    ? 'bg-black dark:bg-primary text-white' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:text-white'
                }`}>
                  Tất cả
                </Link>
                <Link href="/?category=bitcoin" className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full hover:border-gray-400 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-colors ${
                  category === 'bitcoin'
                    ? 'bg-black dark:bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white'
                }`}>
                  <span className="text-orange-500">₿</span> Bitcoin
                </Link>
                <Link href="/?category=ethereum" className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full hover:border-gray-400 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-colors ${
                  category === 'ethereum'
                    ? 'bg-black dark:bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white'
                }`}>
                  <span className="text-blue-500">◆</span> Ethereum
                </Link>
                <Link href="/?category=xrp" className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full hover:border-gray-400 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-colors ${
                  category === 'xrp'
                    ? 'bg-black dark:bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white'
                }`}>
                  <span className="text-gray-700 dark:text-gray-300">✕</span> XRP
                </Link>
                <Link href="/?category=market" className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full hover:border-gray-400 whitespace-nowrap transition-colors ${
                  category === 'market'
                    ? 'bg-black dark:bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white'
                }`}>
                  Thị trường
                </Link>
              </div>
            </div>

            {/* Main Articles Grid - 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {mainArticles.map((article) => (
                <article key={article.id}>
                  <Link href={`/article/${article.id}`} className="group block">
                    {/* Image */}
                    <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-3 bg-gray-900">
                      {article.image && (
                        <ArticleImage 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>

                    {/* Title Only */}
                    <h3 className="font-serif text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-3">
                      {article.title}
                    </h3>
                  </Link>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
