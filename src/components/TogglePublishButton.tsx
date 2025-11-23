"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface TogglePublishButtonProps {
  articleId: string;
  articleTitle: string;
  isPublished: boolean;
}

export default function TogglePublishButton({ articleId, articleTitle, isPublished }: TogglePublishButtonProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    const action = isPublished ? 'ẩn' : 'xuất bản';
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn ${action} bài viết này?\n\n"${articleTitle}"`
    );

    if (!confirmed) return;

    setIsToggling(true);
    try {
      const response = await fetch('/api/article/toggle-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: articleId,
          isPublished: !isPublished 
        }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Lỗi khi cập nhật trạng thái');
      }
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`inline-flex items-center gap-1 px-3 py-1.5 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md hover:scale-105 duration-200 ${
        isPublished 
          ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400' 
          : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
      }`}
      title={isPublished ? 'Ẩn bài viết' : 'Xuất bản bài viết'}
    >
      {isPublished ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      {isToggling ? 'Đang xử lý...' : (isPublished ? 'Ẩn' : 'Xuất bản')}
    </button>
  );
}

