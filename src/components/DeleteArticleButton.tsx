"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteArticleButtonProps {
  articleId: string;
  articleTitle: string;
  onDelete: (articleId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function DeleteArticleButton({ articleId, articleTitle, onDelete }: DeleteArticleButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bài viết này?\n\n"${articleTitle}"\n\nHành động này không thể hoàn tác!`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await onDelete(articleId);
      if (result.success) {
        window.location.reload(); // Reload to update the list
      } else {
        alert('Lỗi khi xóa bài viết: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Lỗi khi xóa bài viết');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
      title="Xóa bài viết"
    >
      <Trash2 className="w-3 h-3" />
      {isDeleting ? 'Đang xóa...' : 'Xóa'}
    </button>
  );
}

