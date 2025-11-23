import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative h-24 w-24">
              <Image 
                src="/logo-thu-vien-tien-so.png" 
                alt="Thư Viện Tiền Số" 
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Về Thư Viện Tiền Số
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Nguồn tin tức crypto hàng đầu Việt Nam
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Giới Thiệu
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong className="text-primary">Thư Viện Tiền Số</strong> là nền tảng tin tức chuyên sâu về thị trường tiền điện tử và công nghệ blockchain tại Việt Nam. Chúng tôi cung cấp thông tin nhanh chóng, chính xác và dễ hiểu nhất về thế giới crypto.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Với đội ngũ biên tập viên giàu kinh nghiệm, chúng tôi tổng hợp và biên tập tin tức từ các nguồn uy tín hàng đầu thế giới như CoinDesk, Cointelegraph, và nhiều nguồn khác.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sứ Mệnh
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Cung cấp tin tức crypto nhanh nhất và chính xác nhất</li>
              <li>Giúp cộng đồng crypto Việt Nam tiếp cận thông tin chất lượng</li>
              <li>Phân tích chuyên sâu về xu hướng thị trường và công nghệ blockchain</li>
              <li>Giáo dục và nâng cao nhận thức về tiền điện tử</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Đội Ngũ
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/tuong-an-avatar.jpg"
                  alt="Tường An"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tường An</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Biên Tập Viên Trưởng</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  5+ năm kinh nghiệm trong lĩnh vực crypto và blockchain
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Liên Hệ Hợp Tác
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Chúng tôi luôn chào đón các cơ hội hợp tác, quảng cáo và đóng góp nội dung từ cộng đồng.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Liên Hệ Ngay
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

