"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArticleImage } from "./ArticleImage";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: Date;
}

interface FeaturedSliderProps {
  articles: Article[];
}

export default function FeaturedSlider({ articles }: FeaturedSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Group articles into pairs for display
  const articlePairs = [];
  for (let i = 0; i < articles.length; i += 2) {
    articlePairs.push(articles.slice(i, i + 2));
  }

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (articlePairs.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articlePairs.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [articlePairs.length]);

  if (articles.length === 0) return null;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articlePairs.length) % articlePairs.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articlePairs.length);
  };

  return (
    <div className="relative group">
      {/* Main Slider - List Layout */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {articlePairs.map((pair, pairIndex) => (
          <div
            key={pairIndex}
            className={`transition-opacity duration-500 ${
              pairIndex === currentIndex ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="space-y-4 sm:space-y-6">
              {pair.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="flex gap-3 sm:gap-4 group/item hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 sm:p-3 transition-colors"
                >
                  {/* Image - 145px width */}
                  <div className="relative w-[145px] h-[97px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-900">
                    {article.image && (
                      <ArticleImage 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>

                  {/* Title Only */}
                  <div className="flex-1 flex items-center min-w-0">
                    <h3 className="font-serif text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover/item:text-primary transition-colors line-clamp-3">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {articlePairs.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                goToPrevious();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-900 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                goToNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center justify-center text-gray-900 dark:text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {articlePairs.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {articlePairs.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  goToSlide(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-gray-400 dark:bg-gray-600 w-2 hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slide Counter */}
      {articlePairs.length > 1 && (
        <div className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
          {currentIndex + 1} / {articlePairs.length}
        </div>
      )}
    </div>
  );
}

