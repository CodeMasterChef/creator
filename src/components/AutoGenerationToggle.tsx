"use client";

import { useState } from "react";
import { Power, PowerOff } from "lucide-react";

interface AutoGenerationToggleProps {
    initialEnabled: boolean;
    variant?: "card" | "inline";
}

export default function AutoGenerationToggle({ initialEnabled, variant = "card" }: AutoGenerationToggleProps) {
    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/settings/toggle-generation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled: !isEnabled }),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            const data = await response.json();
            setIsEnabled(data.enabled);
            
            // Show success message
            alert(data.enabled 
                ? '✅ Tự động cập nhật đã được BẬT' 
                : '⏸️ Tự động cập nhật đã được TẮT'
            );
            
            // Reload page to refresh scheduler status
            window.location.reload();
        } catch (error) {
            console.error('Error toggling auto-generation:', error);
            alert('❌ Lỗi khi cập nhật cài đặt');
        } finally {
            setIsLoading(false);
        }
    };

    const Wrapper = variant === "card" ? "div" : "div";
    const wrapperClass =
        variant === "card"
            ? "bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
            : "";
    const warningClass =
        variant === "card"
            ? "mt-4"
            : "mt-3";

    return (
        <Wrapper className={wrapperClass}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {isEnabled ? (
                            <Power className="w-5 h-5 text-green-600" />
                        ) : (
                            <PowerOff className="w-5 h-5 text-red-600" />
                        )}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Tự Động Cập Nhật
                        </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {isEnabled ? (
                            <>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-2">
                                    ĐANG BẬT
                                </span>
                                Hệ thống sẽ tự động tạo bài viết mới theo lịch đã cấu hình
                            </>
                        ) : (
                            <>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mr-2">
                                    ĐANG TẮT
                                </span>
                                Hệ thống không tự động tạo bài viết. Chỉ có thể tạo thủ công.
                            </>
                        )}
                    </p>
                </div>
                
                <button
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={`
                        relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${isEnabled 
                            ? 'bg-green-600 focus:ring-green-500' 
                            : 'bg-gray-300 dark:bg-gray-600 focus:ring-gray-400'
                        }
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    role="switch"
                    aria-checked={isEnabled}
                >
                    <span className="sr-only">Toggle auto-generation</span>
                    <span
                        className={`
                            pointer-events-none inline-block h-9 w-9 transform rounded-full bg-white shadow ring-0 
                            transition duration-200 ease-in-out
                            ${isEnabled ? 'translate-x-10' : 'translate-x-0'}
                        `}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 m-2 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : isEnabled ? (
                            <Power className="w-5 h-5 m-2 text-green-600" />
                        ) : (
                            <PowerOff className="w-5 h-5 m-2 text-gray-400" />
                        )}
                    </span>
                </button>
            </div>
            
            {!isEnabled && (
                <div className={`${warningClass} p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800`}>
                    <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ <strong>Lưu ý:</strong> Khi tắt tự động cập nhật, bạn sẽ cần tạo bài viết thủ công bằng nút "Generate Article" ở trên.
                    </p>
                </div>
            )}
        </Wrapper>
    );
}
