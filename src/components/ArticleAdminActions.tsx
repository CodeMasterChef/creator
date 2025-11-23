'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import EditArticleModal from './EditArticleModal';

interface ArticleAdminActionsProps {
    article: {
        id: string;
        title: string;
        slug: string;
        content: string;
        image: string;
        tags: string | null;
        isPublished: boolean;
    };
}

export default function ArticleAdminActions({ article }: ArticleAdminActionsProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleTogglePublish = async () => {
        if (!confirm(`Bạn có chắc muốn ${article.isPublished ? 'ẩn' : 'xuất bản'} bài viết này?`)) {
            return;
        }

        setIsToggling(true);
        try {
            const response = await fetch('/api/article/toggle-publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: article.id,
                    isPublished: !article.isPublished 
                }),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Có lỗi xảy ra khi cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Error toggling publish:', error);
            alert('Có lỗi xảy ra');
        } finally {
            setIsToggling(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('⚠️ BẠN CÓ CHẮC MUỐN XÓA BÀI VIẾT NÀY?\n\nHành động này KHÔNG THỂ HOÀN TÁC!')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch('/api/article/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: article.id }),
            });

            if (response.ok) {
                window.location.href = '/admin';
            } else {
                alert('Có lỗi xảy ra khi xóa bài viết');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Có lỗi xảy ra');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
                <Edit size={16} />
                <span className="hidden sm:inline">Chỉnh sửa</span>
            </button>

            <button
                onClick={handleTogglePublish}
                disabled={isToggling}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
                {article.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className="hidden sm:inline">
                    {isToggling ? 'Đang xử lý...' : (article.isPublished ? 'Ẩn bài' : 'Xuất bản')}
                </span>
            </button>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
                <Trash2 size={16} />
                <span className="hidden sm:inline">
                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </span>
            </button>

            {showEditModal && (
                <EditArticleModal
                    article={article}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
}
