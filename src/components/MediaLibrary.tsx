'use client';

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Trash2, RefreshCw } from "lucide-react";

interface MediaFile {
    filename: string;
    url: string;
    size: number;
    createdAt: number;
}

interface MediaLibraryProps {
    articleImages: string[];
}

export default function MediaLibrary({ articleImages }: MediaLibraryProps) {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});

    const normalizedImages = useMemo(
        () =>
            articleImages
                .filter(Boolean)
                .map((src) => src.trim().toLowerCase()),
        [articleImages]
    );

    const fetchFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/uploads", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Không thể tải danh sách file");
            }
            setFiles(data.files || []);
        } catch (err) {
            console.error("Failed to fetch uploads", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const isFileUsed = (file: MediaFile) => {
        return normalizedImages.some((img) => {
            if (!img) return false;
            if (img === file.url.toLowerCase()) return true;
            return img.endsWith(file.url.toLowerCase());
        });
    };

    const unusedFiles = files.filter((file) => !isFileUsed(file));

    const handleDelete = async (filename: string) => {
        if (!confirm("Bạn có chắc muốn xóa file này?")) return;

        setDeleting((prev) => ({ ...prev, [filename]: true }));
        setError(null);
        try {
            const res = await fetch("/api/uploads", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Không thể xóa file");
            }
            setFiles((prev) => prev.filter((file) => file.filename !== filename));
        } catch (err) {
            console.error("Failed to delete upload", err);
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setDeleting((prev) => ({ ...prev, [filename]: false }));
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số file</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {files.length}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Không được dùng</p>
                        <p className="text-2xl font-bold text-red-600">
                            {unusedFiles.length}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={fetchFiles}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Làm mới
                        </button>
                    </div>
                </div>
                {unusedFiles.length > 0 && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Có {unusedFiles.length} file không được sử dụng trong bất kỳ bài viết nào.
                    </p>
                )}
                {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    Đang tải danh sách file...
                </div>
            ) : files.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                    Chưa có file nào được upload.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {files.map((file) => {
                        const used = isFileUsed(file);
                        return (
                            <div
                                key={file.filename}
                                className={`border rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm flex flex-col ${
                                    used
                                        ? "border-gray-200 dark:border-gray-700"
                                        : "border-red-400 ring-1 ring-red-300/70 dark:border-red-700"
                                }`}
                            >
                                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        src={file.url}
                                        alt={file.filename}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                <div className="p-4 flex flex-col gap-2 flex-1">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                                        {file.filename}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                                        <span>{formatSize(file.size)}</span>
                                        <span>•</span>
                                        <span>{new Date(file.createdAt).toLocaleString()}</span>
                                    </div>
                                    {!used && (
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">
                                            Không được sử dụng
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        onClick={() => handleDelete(file.filename)}
                                        disabled={deleting[file.filename]}
                                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {deleting[file.filename] ? "Đang xóa..." : "Xóa file"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
