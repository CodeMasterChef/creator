"use client";

import { useState } from "react";

export default function GenerateTestButton() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

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
                // Refresh the page to show new article
                window.location.reload();
            }
        } catch (error) {
            setResult({ success: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary"
                style={{ marginBottom: '1rem' }}
            >
                {loading ? '🔄 Đang tạo bài...' : '🚀 Test: Tạo Bài Ngay'}
            </button>

            {result && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${result.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    marginTop: '1rem'
                }}>
                    {result.success ? (
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
                                ✅ Thành công!
                            </div>
                            <div className="text-sm">
                                <strong>Tiêu đề:</strong> {result.article.title}<br />
                                <strong>Nguồn:</strong> {result.article.source}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#ef4444' }}>
                            ❌ Lỗi: {result.error}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
