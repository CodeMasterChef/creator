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

export default async function Home() {
  const articles: Article[] = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { date: 'desc' },
    take: 20,
  });

  if (!articles || articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4">Chưa có bài viết</h2>
          <p className="text-gray-600 mb-6">Vào Admin để tạo bài viết mới</p>
          <Link href="/admin" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
            Đến Admin
          </Link>
        </div>
      </div>
    );
  }

  const hero = articles[0];
  const featured = articles.slice(1, 4);
  const latest = articles.slice(4, 10);
  const grid = articles.slice(10);

  // Giả lập sentiment (random cho demo)
  const getSentiment = (idx: number) => {
    const sentiments = ['positive', 'neutral', 'negative'];
    return sentiments[idx % 3];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR - Latest News */}
          <aside className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              {/* Header with RSS icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold">Latest Crypto News</h2>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-sm font-bold text-gray-500 mb-4">Today</h3>
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
                        {getSentiment(idx) === 'positive' ? 'Positive' : 
                         getSentiment(idx) === 'negative' ? 'Negative' : 
                         'Neutral'}
                      </span>
                    </div>
                    
                    {/* Article Link */}
                    <Link href={`/article/${article.id}`} className="group">
                      <h3 className="font-serif text-base font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors">
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Featured Stories</h1>
              
              {/* Category Tabs */}
              <div className="flex items-center gap-3 flex-wrap">
                <button className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-full">
                  All
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-semibold rounded-full hover:border-gray-400 flex items-center gap-2">
                  <span className="text-orange-500">₿</span> Bitcoin News
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-semibold rounded-full hover:border-gray-400 flex items-center gap-2">
                  <span className="text-blue-500">◆</span> Ethereum News
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-semibold rounded-full hover:border-gray-400 flex items-center gap-2">
                  <span className="text-gray-700">✕</span> XRP News
                </button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-sm font-semibold rounded-full hover:border-gray-400">
                  BTC Treasuries Theme Month
                </button>
              </div>
            </div>

            {/* Hero Article */}
            <article className="mb-8">
              <Link href={`/article/${hero.id}`} className="group">
                <div className="relative h-[480px] rounded-xl overflow-hidden bg-gray-900">
                  {hero.image && (
                    <ArticleImage 
                      src={hero.image} 
                      alt={hero.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded mb-3">
                      Markets
                    </span>
                    <h2 className="font-serif text-4xl font-bold text-white mb-3 leading-tight group-hover:text-blue-300 transition-colors">
                      {hero.title}
                    </h2>
                    <p className="text-gray-200 text-lg mb-3 line-clamp-2">
                      {hero.summary}
                    </p>
                    <div className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(hero.date), { addSuffix: true, locale: vi })}
                    </div>
                  </div>
                </div>
              </Link>
            </article>

            {/* Featured Articles - Right Column List */}
            <div className="space-y-6 mb-8">
              {featured.map((article) => (
                <article key={article.id} className="border-b pb-6">
                  <Link href={`/article/${article.id}`} className="group">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded mb-2">
                      Markets
                    </span>
                    <h3 className="font-serif text-xl font-bold leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(article.date), { addSuffix: true, locale: vi })}
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* View All Stories Button */}
            <div className="mb-8">
              <Link 
                href="#" 
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                View all stories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Grid Articles */}
            {grid.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {grid.slice(0, 6).map((article) => (
                  <article key={article.id}>
                    <Link href={`/article/${article.id}`} className="group">
                      <div className="relative h-48 rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-yellow-400 via-pink-500 to-blue-500">
                        {article.image && (
                          <ArticleImage 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        {/* Yellow accent squares (like in CoinDesk) */}
                        <div className="absolute top-3 left-3 flex gap-1">
                          <div className="w-3 h-3 bg-yellow-400"></div>
                          <div className="w-3 h-3 bg-yellow-400"></div>
                        </div>
                      </div>
                      <h3 className="font-serif text-base font-bold leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
