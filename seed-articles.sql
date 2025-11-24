-- Seed Articles SQL for PostgreSQL
-- Insert sample articles about cryptocurrency and blockchain

-- First, ensure we have a SystemSettings record
INSERT INTO "SystemSettings" ("id", "autoGenerationEnabled", "generationInterval", "updatedAt")
VALUES ('settings-001', true, 120, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Insert sample articles
INSERT INTO "Article" (
    "id",
    "title",
    "slug",
    "summary",
    "content",
    "image",
    "tags",
    "date",
    "author",
    "source",
    "sourceUrl",
    "isPublished",
    "createdAt",
    "updatedAt"
) VALUES
(
    'article-001',
    'Bitcoin Vượt Mốc $100,000: Nhà Đầu Tư Kỳ Vọng Tiếp Tục Tăng Trưởng',
    'bitcoin-vuot-moc-100000-nha-dau-tu-ky-vong-tiep-tuc-tang-truong',
    'Giá Bitcoin đã chính thức vượt qua ngưỡng tâm lý quan trọng $100,000, tạo ra làn sóng phấn khích trong cộng đồng crypto. Các nhà phân tích dự đoán xu hướng tăng sẽ tiếp tục trong những tháng tới.',
    '<h2>Tổng Quan</h2>
<p>Bitcoin (BTC) đã đạt một cột mốc lịch sử khi giá vượt qua $100,000 vào đầu tuần này. Đây là lần đầu tiên đồng tiền điện tử hàng đầu thế giới chạm ngưỡng này sau nhiều tháng tích lũy.</p>

<h2>Diễn Biến Thị Trường</h2>
<p>Theo dữ liệu từ các sàn giao dịch lớn, Bitcoin đã tăng <strong>15%</strong> trong tuần qua, từ mức $87,000 lên $102,500 tại thời điểm cao nhất. Khối lượng giao dịch cũng tăng mạnh, đạt <strong>$45 tỷ</strong> trong 24 giờ qua.</p>

<h2>Nguyên Nhân Tăng Giá</h2>
<p>Các chuyên gia cho rằng có nhiều yếu tố thúc đẩy:</p>
<ul>
    <li>Việc các quỹ ETF Bitcoin được phê duyệt tại nhiều quốc gia</li>
    <li>Nhu cầu tích trữ từ các tổ chức lớn</li>
    <li>Lạm phát toàn cầu khiến nhà đầu tư tìm kiếm tài sản dự trữ giá trị</li>
</ul>

<h2>Dự Báo Tương Lai</h2>
<p>Nhiều nhà phân tích kỹ thuật dự đoán Bitcoin có thể tiếp tục tăng lên mức <strong>$120,000 - $150,000</strong> trong quý tới, dựa trên các mô hình sóng Elliott và Fibonacci retracement.</p>',
    'https://cdn.sanity.io/images/s3y3vcno/production/1ae5949456549c27f476733ff0e2adfe605799fb-1918x1080.jpg?auto=format',
    'Bitcoin,Crypto,Thị trường',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'Tường An',
    'CoinDesk',
    'https://www.coindesk.com/example/bitcoin-100k',
    true,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    'article-002',
    'Ethereum 2.0: Cuộc Cách Mạng Staking Và Tác Động Đến Thị Trường',
    'ethereum-2-cuoc-cach-mang-staking-va-tac-dong-den-thi-truong',
    'Ethereum đã hoàn thành quá trình chuyển đổi sang Proof-of-Stake, mở ra kỷ nguyên mới cho việc staking và giảm tiêu thụ năng lượng đáng kể.',
    '<h2>Giới Thiệu</h2>
<p>Ethereum đã chính thức hoàn thành quá trình nâng cấp lên Ethereum 2.0, chuyển từ cơ chế Proof-of-Work sang Proof-of-Stake. Đây được coi là một trong những sự kiện quan trọng nhất trong lịch sử blockchain.</p>

<h2>Lợi Ích Của Ethereum 2.0</h2>
<p>Việc chuyển đổi này mang lại nhiều lợi ích:</p>
<ul>
    <li>Giảm <strong>99.9%</strong> tiêu thụ năng lượng so với trước đây</li>
    <li>Tăng tốc độ giao dịch lên <strong>100,000 TPS</strong> tiềm năng</li>
    <li>Giảm phí gas đáng kể</li>
    <li>Tạo cơ hội staking cho các nhà đầu tư</li>
</ul>

<h2>Tác Động Đến Thị Trường</h2>
<p>Giá ETH đã tăng <strong>25%</strong> sau khi thông báo hoàn thành merge. Hiện tại có hơn <strong>32 triệu ETH</strong> đang được stake, tương đương khoảng <strong>$80 tỷ</strong> giá trị.</p>

<h2>Triển Vọng Tương Lai</h2>
<p>Các nhà phát triển đang tiếp tục làm việc trên các bản nâng cấp tiếp theo như sharding và rollups để cải thiện hơn nữa hiệu suất của mạng lưới.</p>',
    'https://cdn.sanity.io/images/s3y3vcno/production/1ae5949456549c27f476733ff0e2adfe605799fb-1918x1080.jpg?auto=format',
    'Ethereum,Blockchain,Staking',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'Tường An',
    'CoinTelegraph',
    'https://cointelegraph.com/example/ethereum-2',
    true,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
),
(
    'article-003',
    'DeFi Mùa Mới: Các Giao Thức Lending Đạt Tổng Giá Trị Khóa $50 Tỷ',
    'defi-mua-moi-cac-giao-thuc-lending-dat-tong-gia-tri-khoa-50-ty',
    'Tổng giá trị khóa (TVL) trong các giao thức DeFi đã đạt mức cao kỷ lục $50 tỷ, với các nền tảng lending dẫn đầu xu hướng.',
    '<h2>Tổng Quan Thị Trường DeFi</h2>
<p>Thị trường tài chính phi tập trung (DeFi) đang trải qua một giai đoạn tăng trưởng mạnh mẽ. Tổng giá trị khóa (TVL) đã tăng <strong>40%</strong> trong quý vừa qua, đạt mức <strong>$50 tỷ</strong>.</p>

<h2>Các Giao Thức Hàng Đầu</h2>
<p>Theo dữ liệu từ DeFiLlama, các nền tảng lending đang chiếm ưu thế:</p>
<ul>
    <li><strong>Aave</strong>: $12 tỷ TVL</li>
    <li><strong>Compound</strong>: $8.5 tỷ TVL</li>
    <li><strong>MakerDAO</strong>: $7.2 tỷ TVL</li>
    <li><strong>Uniswap</strong>: $6.8 tỷ TVL</li>
</ul>

<h2>Xu Hướng Lending</h2>
<p>Các giao thức lending đang thu hút nhiều nhà đầu tư nhờ lãi suất hấp dẫn, dao động từ <strong>5% đến 15%</strong> APY tùy thuộc vào loại tài sản và rủi ro.</p>

<h2>Rủi Ro Và Cơ Hội</h2>
<p>Mặc dù DeFi mang lại nhiều cơ hội, các nhà đầu tư cần lưu ý về rủi ro smart contract, biến động giá và thanh khoản. Việc nghiên cứu kỹ trước khi đầu tư là vô cùng quan trọng.</p>',
    'https://cdn.sanity.io/images/s3y3vcno/production/1ae5949456549c27f476733ff0e2adfe605799fb-1918x1080.jpg?auto=format',
    'DeFi,Lending,TVL',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    'Tường An',
    'DeFi Pulse',
    'https://defipulse.com/example/tvl-50b',
    true,
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP - INTERVAL '7 days'
),
(
    'article-004',
    'NFT Market Hồi Phục: Doanh Thu Tăng 60% So Với Tháng Trước',
    'nft-market-hoi-phuc-doanh-thu-tang-60-so-voi-thang-truoc',
    'Thị trường NFT đang cho thấy dấu hiệu hồi phục mạnh mẽ với doanh thu tăng 60% và số lượng giao dịch tăng đáng kể.',
    '<h2>Tình Hình Thị Trường NFT</h2>
<p>Sau một giai đoạn suy giảm, thị trường NFT đang cho thấy dấu hiệu hồi phục tích cực. Doanh thu trong tháng này đã đạt <strong>$450 triệu</strong>, tăng <strong>60%</strong> so với tháng trước.</p>

<h2>Các Bộ Sưu Tập Nổi Bật</h2>
<p>Một số bộ sưu tập đang dẫn đầu xu hướng:</p>
<ul>
    <li><strong>Bored Ape Yacht Club</strong>: Giá trung bình $85,000</li>
    <li><strong>CryptoPunks</strong>: Giá trung bình $120,000</li>
    <li><strong>Azuki</strong>: Giá trung bình $15,000</li>
</ul>

<h2>Nguyên Nhân Hồi Phục</h2>
<p>Các chuyên gia cho rằng sự hồi phục này đến từ:</p>
<ul>
    <li>Việc các thương hiệu lớn như Nike, Adidas tiếp tục đầu tư vào NFT</li>
    <li>Sự phát triển của các ứng dụng thực tế cho NFT trong gaming và metaverse</li>
    <li>Giá Ethereum ổn định tạo điều kiện thuận lợi cho giao dịch</li>
</ul>

<h2>Dự Báo</h2>
<p>Nhiều nhà phân tích dự đoán thị trường NFT sẽ tiếp tục tăng trưởng trong quý tới, đặc biệt là các dự án tập trung vào utility và ứng dụng thực tế.</p>',
    'https://cdn.sanity.io/images/s3y3vcno/production/1ae5949456549c27f476733ff0e2adfe605799fb-1918x1080.jpg?auto=format',
    'NFT,Thị trường,Art',
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    'Tường An',
    'OpenSea',
    'https://opensea.io/blog/nft-recovery',
    true,
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
),
(
    'article-005',
    'Solana Vượt Qua Sự Cố: Mạng Lưới Hoạt Động Ổn Định Sau 99.9% Uptime',
    'solana-vuot-qua-su-co-mang-luoi-hoat-dong-on-dinh-sau-99-9-uptime',
    'Solana đã khắc phục các vấn đề về downtime và đạt được độ tin cậy 99.9% trong tháng qua, khôi phục niềm tin của nhà đầu tư.',
    '<h2>Tình Hình Hiện Tại</h2>
<p>Solana đã có một tháng hoạt động ổn định với uptime đạt <strong>99.9%</strong>, một cải thiện đáng kể so với các sự cố downtime trước đây. Điều này đã giúp khôi phục niềm tin của cộng đồng và nhà đầu tư.</p>

<h2>Các Cải Tiến Kỹ Thuật</h2>
<p>Đội ngũ phát triển Solana đã thực hiện nhiều cải tiến:</p>
<ul>
    <li>Nâng cấp validator network để xử lý tải tốt hơn</li>
    <li>Cải thiện cơ chế quản lý bộ nhớ</li>
    <li>Tối ưu hóa throughput lên <strong>3,000 TPS</strong></li>
    <li>Giảm thời gian block time xuống còn <strong>400ms</strong></li>
</ul>

<h2>Tác Động Đến Giá</h2>
<p>Giá SOL đã tăng <strong>30%</strong> sau khi thông báo về độ ổn định của mạng lưới. Hiện tại SOL đang giao dịch quanh mức <strong>$95</strong>, tăng từ mức $73 cách đây một tháng.</p>

<h2>Triển Vọng</h2>
<p>Với độ ổn định được cải thiện, Solana đang thu hút nhiều dự án DeFi và NFT mới. Tổng giá trị khóa (TVL) trên Solana đã đạt <strong>$1.2 tỷ</strong> và tiếp tục tăng trưởng.</p>',
    'https://cdn.sanity.io/images/s3y3vcno/production/1ae5949456549c27f476733ff0e2adfe605799fb-1918x1080.jpg?auto=format',
    'Solana,Blockchain,Uptime',
    CURRENT_TIMESTAMP - INTERVAL '12 days',
    'Tường An',
    'Solana Foundation',
    'https://solana.com/news/uptime-improvement',
    true,
    CURRENT_TIMESTAMP - INTERVAL '12 days',
    CURRENT_TIMESTAMP - INTERVAL '12 days'
),
(
    'article-006',
    'Central Bank Digital Currency: 130 Quốc Gia Đang Nghiên Cứu CBDC',
    'central-bank-digital-currency-130-quoc-gia-dang-nghien-cuu-cbdc',
    'Theo báo cáo mới nhất, hơn 130 quốc gia đang ở các giai đoạn khác nhau trong việc nghiên cứu và phát triển đồng tiền kỹ thuật số của ngân hàng trung ương.',
    '<h2>Tổng Quan CBDC</h2>
<p>Cuộc cách mạng tiền kỹ thuật số của ngân hàng trung ương (CBDC) đang lan rộng trên toàn cầu. Theo nghiên cứu từ IMF, hiện có <strong>130 quốc gia</strong> đang ở các giai đoạn khác nhau trong việc phát triển CBDC của họ.</p>

<h2>Các Quốc Gia Tiên Phong</h2>
<p>Một số quốc gia đã triển khai hoặc đang thử nghiệm CBDC:</p>
<ul>
    <li><strong>Trung Quốc</strong>: Digital Yuan (e-CNY) đã được sử dụng rộng rãi</li>
    <li><strong>Nigeria</strong>: eNaira đã được phát hành</li>
    <li><strong>Bahamas</strong>: Sand Dollar đã đi vào hoạt động</li>
    <li><strong>Ấn Độ</strong>: Digital Rupee đang trong giai đoạn thử nghiệm</li>
</ul>

<h2>Lợi Ích Của CBDC</h2>
<p>CBDC mang lại nhiều lợi ích:</p>
<ul>
    <li>Tăng hiệu quả thanh toán và giảm chi phí</li>
    <li>Cải thiện tài chính toàn diện</li>
    <li>Tăng cường kiểm soát chính sách tiền tệ</li>
    <li>Giảm rủi ro trong hệ thống thanh toán</li>
</ul>

<h2>Thách Thức</h2>
<p>Tuy nhiên, việc triển khai CBDC cũng đối mặt với nhiều thách thức về quyền riêng tư, bảo mật và tác động đến hệ thống ngân hàng truyền thống.</p>',
    'https://cdn.sanity.io/images/s3y3vcno/production/1ae5949456549c27f476733ff0e2adfe605799fb-1918x1080.jpg?auto=format',
    'CBDC,Chính phủ,Regulation',
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    'Tường An',
    'IMF',
    'https://imf.org/cbdc-report',
    true,
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    CURRENT_TIMESTAMP - INTERVAL '15 days'
)
ON CONFLICT ("id") DO NOTHING;

-- Verify inserted articles
SELECT 
    COUNT(*) as total_articles,
    COUNT(CASE WHEN "isPublished" = true THEN 1 END) as published_articles,
    COUNT(CASE WHEN "isPublished" = false THEN 1 END) as draft_articles
FROM "Article";

-- Show article titles
SELECT "id", "title", "slug", "isPublished", "createdAt"
FROM "Article"
ORDER BY "createdAt" DESC;
