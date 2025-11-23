import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import GenerateTestButton from "@/components/GenerateTestButton";
import DeleteArticleButton from "@/components/DeleteArticleButton";
import { LogOut, FileText, CheckCircle, Clock } from "lucide-react";

async function handleSignOut() {
    "use server";
    await signOut();
}

async function deleteArticle(articleId: string) {
    "use server";
    try {
        await prisma.article.delete({
            where: { id: articleId }
        });
        return { success: true };
    } catch (error) {
        console.error('Error deleting article:', error);
        return { success: false, error: 'Failed to delete article' };
    }
}

export default async function AdminDashboard() {
    const session = await auth();

    if (!session) {
        redirect("/admin/login");
    }

    const articles = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    const stats = {
        total: await prisma.article.count(),
        published: await prisma.article.count({ where: { isPublished: true } }),
        draft: await prisma.article.count({ where: { isPublished: false } })
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Xin chào, {session.user?.email || 'Admin'}
                        </p>
                    </div>
                    <form action={handleSignOut}>
                        <button 
                            type="submit" 
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                        >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                        </button>
                    </form>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">
                            {stats.total}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Tổng bài viết
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                            {stats.published}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Đã xuất bản
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                            {stats.draft}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Bản nháp
                        </div>
                    </div>
                </div>

                {/* Generate Article Card */}
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 sm:p-8 mb-8 text-white">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl font-bold mb-2">
                                📰 Tạo Bài Viết Mới
                            </h3>
                            <p className="text-sm sm:text-base text-blue-50 mb-4">
                                Thu thập tin tức mới nhất từ CoinDesk và tự động dịch sang tiếng Việt. 
                                Bài viết sẽ được xuất bản ngay lập tức.
                            </p>
                            <GenerateTestButton />
                        </div>
                    </div>
                </div>

                {/* Articles Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            Bài viết gần đây
                        </h2>
                    </div>

                    {articles.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Chưa có bài viết nào
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Nhấn nút "Tạo Bài Viết Mới" ở trên để bắt đầu
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Tiêu đề
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                                            Nguồn
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                                            Ngày tạo
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {articles.map((article) => (
                                        <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="max-w-xs">
                                                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-1">
                                                        {article.title}
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                                        {article.summary.slice(0, 80)}...
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                                    {article.source || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                                                {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: vi })}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    article.isPublished 
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                                                }`}>
                                                    {article.isPublished ? '✓ Đã xuất bản' : '○ Nháp'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <a 
                                                        href={`/article/${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}?id=${article.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        Xem
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                    <DeleteArticleButton 
                                                        articleId={article.id} 
                                                        articleTitle={article.title}
                                                        onDelete={deleteArticle}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                ⚡ Cập nhật tự động
                            </h3>
                            <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                                Hệ thống tự động thu thập tin tức từ CoinDesk mỗi 2 giờ. 
                                Bài viết được dịch và xuất bản tự động lên trang chủ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
