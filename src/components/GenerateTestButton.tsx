"use client";

import { useState } from "react";
import { Loader2, Sparkles, CheckCircle, XCircle, Copy, Check } from "lucide-react";

export default function GenerateTestButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
            });

            const data = await response.json();
            setResult(data);

            if (data.success) {
                // Refresh the page to show new article after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            setResult({ success: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const copyLog = async () => {
        if (!result) return;
        
        const logText = [
            `=== Generation Error Log ===`,
            `Error: ${result.error || 'Unknown error'}`,
            result.errorDetails ? `\nError Details:\n${result.errorDetails}` : '',
            result.stack ? `\nStack Trace:\n${result.stack}` : '',
        ].filter(Boolean).join('\n');

        try {
            await navigator.clipboard.writeText(logText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy log:', error);
            alert('Không thể copy log!');
        }
    };

    return (
        <div>
            <button
                onClick={handleGenerate}
                disabled={loading}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm sm:text-base
                    transition-all duration-200 shadow-md hover:shadow-lg
                    ${loading 
                        ? 'bg-white/50 cursor-not-allowed' 
                        : 'bg-white text-gray-900 hover:bg-yellow-50 active:scale-95'
                    }
                `}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang tạo bài viết...</span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        <span>Tạo Bài Viết Mới</span>
                    </>
                )}
            </button>

            {result && (
                <div className={`
                    mt-4 p-4 rounded-lg border-2 animate-fade-in
                    ${result.success 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                        : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    }
                `}>
                    {result.success ? (
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="font-semibold text-green-800 dark:text-green-200 mb-2">
                                    ✅ Tạo bài viết thành công!
                                </div>
                                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                    <p><strong>Tiêu đề:</strong> {result.article.title}</p>
                                    <p><strong>Nguồn:</strong> {result.article.source}</p>
                                    <p className="text-xs mt-2 text-green-600 dark:text-green-400">
                                        Đang tải lại trang...
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-semibold text-red-800 dark:text-red-200">
                                        ❌ Có lỗi xảy ra
                                    </div>
                                    <button
                                        onClick={copyLog}
                                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                        title="Copy log"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3 h-3" />
                                                <span>Đã copy</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3 h-3" />
                                                <span>Copy log</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="text-sm text-red-700 dark:text-red-300">
                                    {result.error}
                                </div>
                                {result.errorDetails && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline font-semibold">
                                            📋 Chi tiết kỹ thuật
                                        </summary>
                                        <pre className="text-xs mt-2 p-3 bg-red-100 dark:bg-red-950/50 rounded overflow-x-auto text-red-700 dark:text-red-300 max-h-48 overflow-y-auto">
                                            {result.errorDetails}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
