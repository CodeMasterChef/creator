import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { signOut } from "@/lib/auth";
import GenerateTestButton from "@/components/GenerateTestButton";
import DeleteArticleButton from "@/components/DeleteArticleButton";
import EditArticleButton from "@/components/EditArticleButton";
import TogglePublishButton from "@/components/TogglePublishButton";
import { LogOut, FileText, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import IntervalSettings from "@/components/IntervalSettings";
import GenerationLogsPanel from "@/components/GenerationLogsPanel";
import AutoGenerationToggle from "@/components/AutoGenerationToggle";
import AdminTabView from "@/components/AdminTabView";
import MediaLibrary from "@/components/MediaLibrary";
import CreateArticleButton from "@/components/CreateArticleButton";

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
        orderBy: { createdAt: 'desc' }
    });

    // Check for duplicate images
    const imageMap = new Map<string, string[]>();
    articles.forEach(article => {
        const existingIds = imageMap.get(article.image) || [];
        imageMap.set(article.image, [...existingIds, article.id]);
    });

    const duplicateImages = new Map<string, string[]>();
    imageMap.forEach((ids, imageUrl) => {
        if (ids.length > 1) {
            duplicateImages.set(imageUrl, ids);
        }
    });

    const duplicateArticleIds = new Set(Array.from(duplicateImages.values()).flat());

    // Get system settings
    let currentIntervalMinutes = 120; // default 2 hours
    let autoGenerationEnabled = true; // default enabled
    try {
        const settings = await prisma.systemSettings.findFirst();
        if (settings) {
            currentIntervalMinutes = settings.generationInterval;
            autoGenerationEnabled = settings.autoGenerationEnabled;
        }
    } catch (error) {
        console.log('SystemSettings table not yet created. Using default.');
    }

    // Get generation logs (with fallback if table doesn't exist yet)
    let generationLogs: any[] = [];
    let successCount = 0;
    let failedCount = 0;

    try {
        generationLogs = await prisma.generationLog.findMany({
            orderBy: { startedAt: 'desc' },
            take: 5 // Initial load: 5 logs
        });

        successCount = await prisma.generationLog.count({ where: { status: 'success' } });
        failedCount = await prisma.generationLog.count({ where: { status: 'failed' } });
    } catch (error) {
        console.log('GenerationLog table not yet created. Run migration first.');
    }

    const stats = {
        total: await prisma.article.count(),
        published: await prisma.article.count({ where: { isPublished: true } }),
        draft: await prisma.article.count({ where: { isPublished: false } }),
        duplicates: duplicateArticleIds.size
    };

    const settingsContent = (
        <>
            <div className="mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Tự Động Cập Nhật
                </h2>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-5 sm:p-6">
                    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 items-start">
                        <div className="lg:col-span-2 space-y-3">
                            <AutoGenerationToggle initialEnabled={autoGenerationEnabled} variant="inline" />
                            <IntervalSettings currentIntervalMinutes={currentIntervalMinutes} variant="inline" />
                        </div>
                        <div className="rounded-lg shadow p-4 sm:p-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/60 dark:bg-white/10 rounded-lg backdrop-blur-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base sm:text-lg font-bold">
                                        Tạo Bài Viết Ngay
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-1">
                                        Lấy tin mới, dịch và xuất bản tức thì.
                                    </p>
                                </div>
                            </div>
                            <div>
                                <GenerateTestButton />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Lịch Sử Tạo Bài Tự Động
                </h2>
                <GenerationLogsPanel
                    initialLogs={generationLogs}
                    successCount={successCount}
                    failedCount={failedCount}
                />
            </div>
        </>
    );

    const articlesContent = (
        <>
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        Thống kê bài viết
                    </h2>
                    <CreateArticleButton />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
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

                    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border ${
                        stats.duplicates > 0
                            ? 'border-red-300 dark:border-red-700 ring-2 ring-red-200 dark:ring-red-900'
                            : 'border-gray-200 dark:border-gray-700'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${
                                stats.duplicates > 0
                                    ? 'p-3 rounded-lg bg-red-100 dark:bg-red-900/30'
                                    : 'p-3 rounded-lg bg-gray-100 dark:bg-gray-700'
                            }`}>
                                <svg className={`${
                                    stats.duplicates > 0
                                        ? 'w-6 h-6 text-red-600 dark:text-red-400'
                                        : 'w-6 h-6 text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className={`text-3xl sm:text-4xl font-bold mb-1 ${
                            stats.duplicates > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}>
                            {stats.duplicates}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Bài trùng lặp
                        </div>
                    </div>
                </div>
            </div>

            {stats.duplicates > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-4 sm:p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg flex-shrink-0">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                                ⚠️ Phát Hiện {stats.duplicates} Bài Viết Trùng Lặp
                            </h3>
                            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                                Tìm thấy <strong>{duplicateImages.size} nhóm ảnh</strong> được sử dụng bởi nhiều bài viết. 
                                Các bài viết này có thể là nội dung trùng lặp.
                            </p>
                            <div className="space-y-2">
                                {Array.from(duplicateImages.entries()).slice(0, 3).map(([imageUrl, ids], index) => (
                                    <div key={index} className="bg-white dark:bg-red-950/50 rounded-lg p-3 text-sm">
                                        <div className="flex items-start gap-2 mb-2">
                                            <span className="inline-flex items-center justify-center w-5 h-5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full text-xs font-bold flex-shrink-0">
                                                {ids.length}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                                                    {imageUrl.slice(0, 80)}...
                                                </p>
                                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                                    Được dùng bởi: {ids.slice(0, 3).map(id => {
                                                        const article = articles.find(a => a.id === id);
                                                        return article?.title.slice(0, 30) + '...';
                                                    }).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {duplicateImages.size > 3 && (
                                    <p className="text-xs text-red-700 dark:text-red-300 italic">
                                        ... và {duplicateImages.size - 3} nhóm khác
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-20">
                                        Ảnh
                                    </th>
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
                                {articles.map((article) => {
                                    const isDuplicate = duplicateArticleIds.has(article.id);
                                    return (
                                        <tr key={article.id} className={`transition-all duration-150 group ${
                                            isDuplicate ? 'bg-red-50 dark:bg-red-950/20' : ''
                                        }`}>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                                                    <Image
                                                        src={article.image}
                                                        alt={article.title}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="max-w-xs">
                                                    {isDuplicate && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full mb-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                            TRÙNG
                                                        </span>
                                                    )}
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
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <a 
                                                        href={`/article/${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}?id=${article.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-yellow-500 dark:hover:bg-yellow-400 text-white dark:text-gray-900 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                                                    >
                                                        Xem
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                    <EditArticleButton
                                                        article={{
                                                            id: article.id,
                                                            title: article.title,
                                                            slug: article.slug || article.id,
                                                            content: article.content,
                                                            image: article.image,
                                                            tags: article.tags,
                                                            isPublished: article.isPublished
                                                        }}
                                                    />
                                                    <TogglePublishButton
                                                        articleId={article.id}
                                                        articleTitle={article.title}
                                                        isPublished={article.isPublished}
                                                    />
                                                    <DeleteArticleButton 
                                                        articleId={article.id} 
                                                        articleTitle={article.title}
                                                        onDelete={deleteArticle}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );

    const libraryContent = (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Thư viện ảnh
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quản lý các file đã upload và xóa những file không còn được sử dụng trong bài viết.
                </p>
            </div>
            <MediaLibrary
                articles={articles.map((article) => ({
                    id: article.id,
                    title: article.title,
                    slug: article.slug,
                    image: article.image,
                }))}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto">
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

                <AdminTabView
                    settings={settingsContent}
                    articles={articlesContent}
                    library={libraryContent}
                />
            </div>
        </div>
    );
}
