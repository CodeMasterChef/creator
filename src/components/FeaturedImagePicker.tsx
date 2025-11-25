"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Images, Loader2, RefreshCw, Search, UploadCloud, CheckCircle2 } from "lucide-react";

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  createdAt: number;
}

interface FeaturedImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

type PickerTab = "url" | "upload" | "library";

export default function FeaturedImagePicker({ value, onChange }: FeaturedImagePickerProps) {
  const [activeTab, setActiveTab] = useState<PickerTab>("url");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLibrary = useCallback(async () => {
    setLoadingLibrary(true);
    setLibraryError(null);
    try {
      const res = await fetch("/api/uploads", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tải thư viện ảnh");
      }
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to load media library", error);
      setLibraryError(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoadingLibrary(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "library" && files.length === 0 && !loadingLibrary) {
      fetchLibrary();
    }
  }, [activeTab, files.length, loadingLibrary, fetchLibrary]);

  const handleImageUrlChange = (url: string) => {
    onChange(url);
    setUploadError(null);
  };

  const handleLocalImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const data = new FormData();
      data.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.error || "Upload failed");
      }

      onChange(result.url);
      setActiveTab("upload");
    } catch (error) {
      console.error("Image upload failed:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) return files;
    const term = searchTerm.toLowerCase();
    return files.filter(
      (file) =>
        file.filename.toLowerCase().includes(term) ||
        file.url.toLowerCase().includes(term)
    );
  }, [files, searchTerm]);

  const tabButtonClass = (tab: PickerTab) =>
    `flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
      activeTab === tab
        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
        : "text-gray-600 dark:text-gray-300"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1 text-sm font-semibold">
        <button type="button" onClick={() => setActiveTab("url")} className={tabButtonClass("url")}>
          Nhập URL
        </button>
        <button type="button" onClick={() => setActiveTab("upload")} className={tabButtonClass("upload")}>
          <UploadCloud className="w-4 h-4" />
          Tải lên
        </button>
        <button type="button" onClick={() => setActiveTab("library")} className={tabButtonClass("library")}>
          <Images className="w-4 h-4" />
          Thư viện
        </button>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-4 space-y-4">
        {activeTab === "url" ? (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              URL ảnh
            </label>
            <input
              type="text"
              inputMode="url"
              value={value}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dán link ảnh bên thứ ba hoặc CDN. Chúng tôi sẽ sử dụng trực tiếp URL này.
            </p>
          </div>
        ) : activeTab === "upload" ? (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Tải file từ máy
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLocalImageUpload}
              className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/80 file:text-gray-900 hover:file:bg-primary cursor-pointer"
              disabled={isUploading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Kích thước tối đa 5MB. Ảnh sẽ được lưu trong thư mục uploads.
            </p>
            {isUploading && (
              <p className="mt-1 inline-flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Đang tải ảnh...
              </p>
            )}
            {uploadError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{uploadError}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={fetchLibrary}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                disabled={loadingLibrary}
              >
                <RefreshCw className={`w-4 h-4 ${loadingLibrary ? "animate-spin" : ""}`} />
                Làm mới
              </button>
            </div>

            {libraryError && (
              <p className="text-sm text-red-600 dark:text-red-400">{libraryError}</p>
            )}

            {loadingLibrary ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-10 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tải thư viện ảnh...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-10 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                Chưa có ảnh nào phù hợp.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredFiles.map((file) => {
                  const isSelected = value === file.url;
                  return (
                    <button
                      type="button"
                      key={file.filename}
                      onClick={() => onChange(file.url)}
                      className={`relative border rounded-lg overflow-hidden text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/40"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800">
                        <Image
                          src={file.url}
                          alt={file.filename}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-all">
                          {file.filename}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(file.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-gray-900 text-xs font-semibold shadow">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã chọn
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {value && (
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Ảnh đang sử dụng
            </p>
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <Image
                  src={value}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                {value}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
