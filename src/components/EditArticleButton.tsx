"use client";

import { Edit } from "lucide-react";
import { useState } from "react";
import EditArticleModal from "./EditArticleModal";

interface EditArticleButtonProps {
  article: {
    id: string;
    title: string;
    slug: string;
    content: string;
    image: string;
    tags: string | null;
    isPublished: boolean;
  };
}

export default function EditArticleButton({ article }: EditArticleButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md hover:scale-105 duration-200"
        title="Chỉnh sửa bài viết"
      >
        <Edit className="w-3 h-3" />
        Sửa
      </button>
      
      {isModalOpen && (
        <EditArticleModal
          article={article}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

