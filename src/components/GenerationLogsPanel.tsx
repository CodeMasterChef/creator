'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

interface GenerationLog {
    id: string;
    status: string;
    articlesCreated: number;
    errorMessage: string | null;
    errorDetails: string | null;
    startedAt: Date;
    completedAt: Date | null;
    duration: number | null;
}

interface GenerationLogsPanelProps {
    initialLogs: GenerationLog[];
    successCount: number;
    failedCount: number;
}

export default function GenerationLogsPanel({ 
    initialLogs, 
    successCount: initialSuccessCount, 
    failedCount: initialFailedCount 
}: GenerationLogsPanelProps) {
    const [logs, setLogs] = useState<GenerationLog[]>(initialLogs);
    const [successCount, setSuccessCount] = useState(initialSuccessCount);
    const [failedCount, setFailedCount] = useState(initialFailedCount);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [countdown, setCountdown] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(initialLogs.length);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    
    const logsPerPage = 5;

    const refreshLogs = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch(`/api/generation-logs?page=${currentPage}&limit=${logsPerPage}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs);
                setSuccessCount(data.successCount);
                setFailedCount(data.failedCount);
                setTotalLogs(data.total);
                setCountdown(10); // Reset countdown
            }
        } catch (error) {
            console.error('Failed to refresh logs:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const deleteLog = async (logId: string) => {
        if (!confirm('Bạn có chắc muốn xóa log này?')) return;
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/generation-logs?id=${logId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await refreshLogs();
            } else {
                alert('Xóa thất bại!');
            }
        } catch (error) {
            console.error('Failed to delete log:', error);
            alert('Xóa thất bại!');
        } finally {
            setIsDeleting(false);
        }
    };

    const deleteAllLogs = async () => {
        setIsDeleting(true);
        setShowDeleteAllConfirm(false);
        try {
            const response = await fetch('/api/generation-logs?all=true', {
                method: 'DELETE',
            });
            if (response.ok) {
                setLogs([]);
                setSuccessCount(0);
                setFailedCount(0);
                setTotalLogs(0);
                setCurrentPage(1);
            } else {
                alert('Xóa thất bại!');
            }
        } catch (error) {
            console.error('Failed to delete all logs:', error);
            alert('Xóa thất bại!');
        } finally {
            setIsDeleting(false);
        }
    };

    // Auto-refresh every 10 seconds
    useEffect(() => {
        if (!autoRefresh) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    refreshLogs();
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [autoRefresh, currentPage]);

    // Refresh when page changes
    useEffect(() => {
        refreshLogs();
    }, [currentPage]);

    const totalPages = Math.ceil(totalLogs / logsPerPage);

    return (
        <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <h3 className="text-lg sm:text-xl font-bold dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Lịch Sử Tạo Bài Tự Động
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({totalLogs} logs)
                    </span>
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {successCount} thành công / {failedCount} thất bại
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                autoRefresh 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title={autoRefresh ? 'Tắt tự động refresh' : 'Bật tự động refresh'}
                        >
                            {autoRefresh ? `🔄 Auto (${countdown}s)` : '⏸️ Tắt'}
                        </button>
                        <button
                            onClick={refreshLogs}
                            disabled={isRefreshing}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-yellow-500 dark:hover:bg-yellow-400 text-white dark:text-gray-900 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh ngay"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        {logs.length > 0 && (
                            <button
                                onClick={() => setShowDeleteAllConfirm(true)}
                                disabled={isDeleting}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Xóa tất cả logs"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Xóa tất cả</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete All Confirmation Modal */}
            {showDeleteAllConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Xác nhận xóa tất cả
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Bạn có chắc chắn muốn xóa <strong>tất cả {totalLogs} logs</strong>? 
                                    Hành động này không thể hoàn tác!
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteAllConfirm(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={deleteAllLogs}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
                            >
                                {isDeleting ? 'Đang xóa...' : 'Xóa tất cả'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có lịch sử tạo bài tự động</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map((log) => (
                        <details key={log.id} className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <summary className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer list-none transition-colors">
                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            deleteLog(log.id);
                                        }}
                                        disabled={isDeleting}
                                        className="flex-shrink-0 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group/delete"
                                        title="Xóa log này"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600 dark:group-hover/delete:text-red-400" />
                                    </button>
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono min-w-[140px]">
                                            {format(new Date(log.startedAt), 'HH:mm:ss - dd/MM', { locale: vi })}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold min-w-[100px] justify-center ${
                                            log.status === 'success' 
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                                : log.status === 'failed'
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        }`}>
                                            {log.status === 'success' ? '✅' : log.status === 'failed' ? '❌' : '🔄'}
                                            {log.status === 'success' ? 'Thành công' : log.status === 'failed' ? 'Thất bại' : 'Đang chạy'}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong className="font-semibold">{log.articlesCreated || 0}</strong> bài viết
                                        </span>
                                        {log.duration && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                • {(log.duration / 1000).toFixed(1)}s
                                            </span>
                                        )}
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </summary>
                            <div className="px-4 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <div className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Bắt đầu:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {format(new Date(log.startedAt), 'HH:mm:ss - dd/MM/yyyy', { locale: vi })}
                                            </p>
                                        </div>
                                        {log.completedAt && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Kết thúc:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {format(new Date(log.completedAt), 'HH:mm:ss - dd/MM/yyyy', { locale: vi })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">Bài viết tạo:</span>
                                            <p className="font-semibold text-green-600 dark:text-green-400">
                                                {log.articlesCreated || 0}
                                            </p>
                                        </div>
                                        {log.duration && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Thời lượng:</span>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {(log.duration / 1000).toFixed(2)} giây
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {log.status === 'failed' && log.errorMessage && (
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">❌ Thông báo lỗi:</p>
                                            <p className="text-xs text-red-700 dark:text-red-300 font-mono bg-red-100 dark:bg-red-950/50 p-2 rounded">
                                                {log.errorMessage}
                                            </p>
                                            {log.errorDetails && (
                                                <details className="mt-2">
                                                    <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline font-semibold">
                                                        📋 Chi tiết kỹ thuật
                                                    </summary>
                                                    <pre className="text-xs mt-2 p-3 bg-red-100 dark:bg-red-950/50 rounded overflow-x-auto text-red-700 dark:text-red-300 max-h-48 overflow-y-auto">
                                                        {log.errorDetails}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    )}

                                    {log.status === 'success' && (
                                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <p className="text-xs text-green-700 dark:text-green-300">
                                                ✅ Hoàn thành thành công! Đã tạo <strong>{log.articlesCreated}</strong> bài viết mới.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </details>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Trang {currentPage} / {totalPages} • {totalLogs} logs
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                        >
                            ← Trước
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-primary text-white dark:text-gray-900'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                        >
                            Sau →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

