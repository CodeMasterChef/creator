'use client';

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, RefreshCw, Edit3, X, Check } from "lucide-react";
import { generateArticleUrl } from "@/lib/slugify";

interface MediaFile {
    filename: string;
    url: string;
    size: number;
    createdAt: number;
}

interface ArticleSummary {
    id: string;
    title: string;
    slug: string | null;
    image: string | null;
}

interface MediaLibraryProps {
    articles: ArticleSummary[];
}

const matchArticleToFile = (image: string | null, file: MediaFile) => {
    if (!image) return false;
    const normalizedImage = image.trim().toLowerCase();
    const fileUrl = file.url.toLowerCase();
    const filename = file.filename.toLowerCase();

    if (normalizedImage === fileUrl) return true;
    if (normalizedImage.endsWith(fileUrl)) return true;
    if (normalizedImage.endsWith(filename)) return true;

    const uploadsIndex = normalizedImage.lastIndexOf("/uploads/");
    if (uploadsIndex !== -1) {
        const extracted = normalizedImage.substring(uploadsIndex + "/uploads/".length);
        if (extracted === filename || extracted.endsWith(filename)) {
            return true;
        }
    }

    return false;
};

export default function MediaLibrary({ articles }: MediaLibraryProps) {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [articleRefs, setArticleRefs] = useState<ArticleSummary[]>(articles);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});
    const [renameState, setRenameState] = useState<{ filename: string; value: string } | null>(null);
    const [renameLoading, setRenameLoading] = useState(false);
    const [renameError, setRenameError] = useState<string | null>(null);

    useEffect(() => {
        setArticleRefs(articles);
    }, [articles]);

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

    const { usageMap, unusedFiles } = useMemo(() => {
        const map = new Map<string, ArticleSummary[]>();
        const unused: MediaFile[] = [];

        files.forEach((file) => {
            const usage = articleRefs.filter((article) => matchArticleToFile(article.image, file));
            map.set(file.filename, usage);
            if (usage.length === 0) {
                unused.push(file);
            }
        });

        return { usageMap: map, unusedFiles: unused };
    }, [files, articleRefs]);

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

    const handleStartRename = (file: MediaFile) => {
        setRenameError(null);
        setRenameState({ filename: file.filename, value: file.filename });
    };

    const handleRenameSubmit = async () => {
        if (!renameState) return;
        const newName = renameState.value.trim();

        if (!newName) {
            setRenameError("Tên file không được để trống");
            return;
        }

        if (newName === renameState.filename) {
            setRenameError("Tên file mới phải khác tên cũ");
            return;
        }

        if (!/^[A-Za-z0-9._-]+$/.test(newName)) {
            setRenameError("Chỉ dùng chữ, số, dấu chấm, gạch ngang hoặc gạch dưới");
            return;
        }

        setRenameLoading(true);
        setRenameError(null);
        try {
            const res = await fetch("/api/uploads", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldFilename: renameState.filename,
                    newFilename: newName,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Không thể đổi tên file");
            }
            setFiles((prev) =>
                prev.map((file) =>
                    file.filename === renameState.filename
                        ? { ...file, filename: newName, url: data.file?.url || `/uploads/${newName}` }
                        : file
                )
            );
            setArticleRefs((prev) =>
                prev.map((article) => {
                    if (!article.image) return article;
                    if (!article.image.includes(renameState.filename)) return article;
                    return {
                        ...article,
                        image: article.image.replace(renameState.filename, newName),
                    };
                })
            );
            setRenameState(null);
        } catch (err) {
            console.error("Failed to rename upload", err);
            setRenameError(err instanceof Error ? err.message : "Có lỗi xảy ra khi đổi tên");
        } finally {
            setRenameLoading(false);
        }
    };

    const handleCancelRename = () => {
        setRenameState(null);
        setRenameError(null);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    };

    const resolveArticleUrl = (article: ArticleSummary) => {
        if (article.slug) {
            return `/article/${article.slug}?id=${article.id}`;
        }
        return generateArticleUrl(article.title, article.id);
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
                        const usage = usageMap.get(file.filename) || [];
                        const used = usage.length > 0;
                        const isRenaming = renameState?.filename === file.filename;

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
                                <div className="p-4 flex flex-col gap-3 flex-1">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                                        {file.filename}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                                        <span>{formatSize(file.size)}</span>
                                        <span>•</span>
                                        <span>{new Date(file.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                        {used ? (
                                            <>
                                                <span className="font-semibold">
                                                    Đang dùng trong {usage.length} bài viết:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {usage.map((article) => (
                                                        <Link
                                                            key={article.id}
                                                            href={resolveArticleUrl(article)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors"
                                                        >
                                                            {article.title.slice(0, 26)}{article.title.length > 26 ? "…" : ""}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">
                                                Không được sử dụng
                                            </span>
                                        )}
                                    </div>
                                    {isRenaming ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                Đổi tên file
                                            </label>
                                            <input
                                                type="text"
                                                value={renameState.value}
                                                onChange={(e) =>
                                                    setRenameState((prev) =>
                                                        prev ? { ...prev, value: e.target.value } : prev
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            {renameError && (
                                                <p className="text-xs text-red-600 dark:text-red-400">{renameError}</p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleRenameSubmit}
                                                    disabled={renameLoading}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-primary hover:bg-yellow-500 rounded-lg disabled:opacity-60"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    {renameLoading ? "Đang lưu..." : "Lưu tên mới"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelRename}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleStartRename(file)}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            Đổi tên file
                                        </button>
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
