"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateArticleModal from "./CreateArticleModal";

export default function CreateArticleButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg shadow-sm hover:shadow-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        Tạo bài viết mới
      </button>
      {open && <CreateArticleModal onClose={() => setOpen(false)} />}
    </>
  );
}
