'use client';

import { useState } from 'react';
import { triggerAutoGenerate } from '../actions';
import { Loader2, Sparkles } from 'lucide-react';

export default function GenerateButton() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [message, setMessage] = useState('');

    const handleGenerate = async () => {
        setIsGenerating(true);
        setMessage('');

        const result = await triggerAutoGenerate();

        setMessage(result.message);
        setIsGenerating(false);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn btn-primary"
                style={{ fontSize: '1.2rem', padding: '1rem 2rem', opacity: isGenerating ? 0.7 : 1 }}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="animate-spin" style={{ marginRight: '0.5rem' }} />
                        Đang Tạo Nội Dung...
                    </>
                ) : (
                    <>
                        <Sparkles style={{ marginRight: '0.5rem' }} />
                        Tự Động Viết Bài Mới
                    </>
                )}
            </button>

            {message && (
                <p className="animate-fade-in" style={{ marginTop: '1rem', color: message.includes('Failed') ? 'red' : 'var(--accent-primary)' }}>
                    {message}
                </p>
            )}
        </div>
    );
}
