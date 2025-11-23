import Parser from 'rss-parser';
import { Article } from './db';

const parser = new Parser();
const RSS_SOURCES = [
    { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'Decrypt', url: 'https://decrypt.co/feed' },
    { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/' }
];

const FALLBACK_TOPICS = [
    "Solana Vượt Qua Mức Cao Nhất Mọi Thời Đại",
    "Token AI Mới Ra Mắt Trên Binance",
    "Quy Định Rõ Ràng Sắp Tới Cho Thị Trường Crypto Mỹ",
    "Dòng Tiền Vào Bitcoin ETF Đạt Kỷ Lục",
    "Vụ Hack Giao Thức DeFi Để Lộ Lỗ Hổng Bảo Mật"
];

const FALLBACK_IMAGES = [
    "https://placehold.co/600x400?text=Thi+Truong+Crypto",
    "https://placehold.co/600x400?text=Cong+Nghe+Blockchain",
    "https://placehold.co/600x400?text=Tai+San+So",
    "https://placehold.co/600x400?text=Bieu+Do+Giao+Dich"
];

export async function generateArticle(): Promise<Article> {
    try {
        // Pick a random source
        const source = RSS_SOURCES[Math.floor(Math.random() * RSS_SOURCES.length)];
        const feed = await parser.parseURL(source.url);

        if (!feed.items || feed.items.length === 0) {
            throw new Error("Không tìm thấy bài viết nào trong RSS feed");
        }

        // Pick a random item from the latest 10 to ensure variety
        const item = feed.items[Math.floor(Math.random() * Math.min(10, feed.items.length))];

        // Try to extract an image from the content if possible, otherwise use fallback
        const image = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

        // Simulate "rewriting" by structuring the content
        const content = `
            <article>
                <p class="lead"><strong>${item.title}</strong></p>
                <p>${item.contentSnippet || item.content || 'Không có tóm tắt.'}</p>
                
                <h2>Bối Cảnh Thị Trường</h2>
                <p>Sự phát triển này diễn ra vào thời điểm quan trọng đối với thị trường tiền điện tử. Các nhà phân tích đề nghị theo dõi các token liên quan để biết khả năng biến động.</p>
                
                <div class="bg-gray-100 p-4 rounded-lg my-4">
                    <h3 class="text-lg font-bold">Thông Tin Nhanh</h3>
                    <ul class="list-disc pl-5">
                        <li><strong>Nguồn:</strong> ${source.name}</li>
                        <li><strong>Đã xuất bản:</strong> ${item.pubDate ? new Date(item.pubDate).toLocaleString('vi-VN') : 'Vừa xong'}</li>
                        <li><strong>Tác giả:</strong> ${item.creator || 'Không rõ'}</li>
                    </ul>
                </div>

                <p><em><small>Bài viết này được tổng hợp và định dạng tự động từ các nguồn bên ngoài. <a href="${item.link}" target="_blank" class="text-blue-600 hover:underline">Đọc bài gốc</a>.</small></em></p>
            </article>
        `;

        return {
            id: Date.now().toString(),
            title: item.title || "Cập Nhật Tin Tức Crypto",
            summary: item.contentSnippet?.slice(0, 150) + "..." || "Tin tức nóng hổi về thị trường crypto.",
            content: content,
            image: image,
            date: new Date().toISOString(),
            author: "AI Aggregator"
        };

    } catch (error) {
        console.error("Failed to fetch RSS, using fallback:", error);

        // Fallback to original random logic
        const topic = FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];
        const image = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

        const content = `
            <p>Thị trường tiền điện tử đang chứng kiến một biến động đáng kể khác khi <strong>${topic}</strong> thống trị các tiêu đề hôm nay.</p>
            <h2>Phân Tích Thị Trường</h2>
            <p>Các nhà phân tích đang chỉ ra sự quan tâm gia tăng từ các tổ chức và các yếu tố kinh tế vĩ mô là những động lực chính. "Chúng ta đang thấy một sự thay đổi mô hình," chuyên gia crypto hàng đầu Nguyễn Văn A nhận định.</p>
            <h2>Điều Này Có Nghĩa Gì Với Nhà Đầu Tư</h2>
            <p>Đối với các nhà đầu tư nhỏ lẻ, đây có thể là tín hiệu để theo dõi các mức kháng cự quan trọng. Biến động dự kiến sẽ vẫn ở mức cao trong những ngày tới.</p>
            <p><em>Tuyên bố miễn trừ trách nhiệm: Đây là nội dung do AI tạo ra và không phải là lời khuyên tài chính.</em></p>
        `;

        return {
            id: Date.now().toString(),
            title: topic,
            summary: `Tin nóng: ${topic}. Đọc thêm về các xu hướng thị trường và phân tích mới nhất.`,
            content,
            image,
            date: new Date().toISOString(),
            author: "AI Auto-Bot"
        };
    }
}
