"use client";

import { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import FeaturedImagePicker from "./FeaturedImagePicker";

interface EditArticleModalProps {
  article: {
    id: string;
    title: string;
    slug: string;
    content: string;
    image: string;
    tags: string | null;
    isPublished: boolean;
  };
  onClose: () => void;
}

export default function EditArticleModal({ article, onClose }: EditArticleModalProps) {
  const isOpen = true; // Always open when component is rendered
  const [formData, setFormData] = useState({
    title: article.title,
    slug: article.slug,
    content: article.content,
    image: article.image,
    tags: article.tags || "",
    isPublished: article.isPublished,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        image: article.image,
        tags: article.tags || "",
        isPublished: article.isPublished,
      });
    }
  }, [isOpen, article]);

  useEffect(() => {
    // Sync TinyMCE theme with current Tailwind dark mode class only (no system fallback to avoid force-dark)
    const updateTheme = () => {
      const html = document.documentElement;
      setIsDark(html.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!formData.image.trim()) {
      alert("Vui lòng chọn ảnh đại diện cho bài viết");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/article/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: article.id,
          ...formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        onClose();
        window.location.reload();
      } else {
        alert("Lỗi khi cập nhật: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error('Update error:', error);
      alert("Lỗi khi cập nhật bài viết");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title });
    
    // Generate slug from Vietnamese title
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 60); // Limit length
    
    setFormData(prev => ({ ...prev, title, slug: slug || prev.slug }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[98vw] lg:max-w-[95vw] xl:max-w-[90vw] max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chỉnh Sửa Bài Viết
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 lg:space-y-4">
          <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Left column: title, slug, content */}
            <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm p-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tiêu Đề
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                    pattern="[a-z0-9-]+"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Chỉ sử dụng chữ thường, số và dấu gạch ngang
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Nội Dung (HTML)
                  </label>
                </div>
                <div className="p-4">
                  <Editor
                    key={isDark ? "tinymce-dark" : "tinymce-light"}
                    apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
                    value={formData.content}
                    onEditorChange={(content) => setFormData({ ...formData, content })}
                    init={{
                      height: 520,
                      menubar: false,
                      skin: isDark ? "oxide-dark" : "oxide",
                      content_css: isDark ? "dark" : "default",
                      plugins: [
                        "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
                        "searchreplace", "visualblocks", "code", "fullscreen",
                        "insertdatetime", "media", "table", "help", "wordcount"
                      ],
                      toolbar:
                        "undo redo | blocks | bold italic underline forecolor | " +
                        "alignleft aligncenter alignright alignjustify | " +
                        "bullist numlist outdent indent | link image media | removeformat | code fullscreen",
                      content_style:
                        "body { font-family:Inter, system-ui, -apple-system, sans-serif; font-size:14px; background-color: transparent; color: inherit; }",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right column: publish + meta */}
            <div className="space-y-4 lg:space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Xuất bản bài viết này
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 w-full">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="flex-1 px-5 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] px-5 py-3 bg-primary hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm p-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tags (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Bitcoin, Ethereum, DeFi, NFT"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Ví dụ: Bitcoin, Ethereum, DeFi, NFT
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ảnh Đại Diện
                  </label>
                  <FeaturedImagePicker
                    value={formData.image}
                    onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
