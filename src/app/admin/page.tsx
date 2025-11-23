import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import GenerateTestButton from "@/components/GenerateTestButton";

async function handleSignOut() {
    "use server";
    await signOut();
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
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <form action={handleSignOut}>
                    <button type="submit" className="btn-secondary">
                        Đăng xuất
                    </button>
                </form>
            </div>

            <div className="grid-cols-3" style={{ marginBottom: '3rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                        {stats.total}
                    </div>
                    <div className="text-gray">Tổng bài viết</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#10b981' }}>
                        {stats.published}
                    </div>
                    <div className="text-gray">Đã xuất bản</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b' }}>
                        {stats.draft}
                    </div>
                    <div className="text-gray">Nháp</div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>📰 Tạo Bài Viết Mới</h3>
                <p className="text-sm text-gray" style={{ marginBottom: '1rem' }}>
                    Thu thập tin tức mới nhất từ các nguồn tin uy tín và xuất bản lên trang.
                </p>
                <GenerateTestButton />
            </div>

            <div className="card">
                <h2 style={{ marginBottom: '1.5rem' }}>Bài viết gần đây</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Tiêu đề</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nguồn</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Ngày tạo</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Trạng thái</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr key={article.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ maxWidth: '300px' }}>
                                            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{article.title}</div>
                                            <div className="text-sm text-gray">{article.summary.slice(0, 80)}...</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className="text-sm">{article.source || 'N/A'}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className="text-sm text-gray">
                                            {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: vi })}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            background: article.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: article.isPublished ? '#10b981' : '#f59e0b'
                                        }}>
                                            {article.isPublished ? 'Đã xuất bản' : 'Nháp'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Link href={`/article/${article.id}`} className="text-sm" style={{ color: 'var(--accent-primary)' }}>
                                            Xem
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>⚡ Cập nhật tự động</h3>
                <p className="text-sm text-gray">
                    Hệ thống cập nhật tin tức từ các nguồn RSS uy tín mỗi 2 giờ.
                    Bài viết được biên tập và xuất bản ngay lập tức.
                </p>
            </div>
        </div>
    );
}
