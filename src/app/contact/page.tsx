export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Liên Hệ
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Kết nối với chúng tôi qua Facebook để được hỗ trợ nhanh nhất
        </p>

        <div className="max-w-xl mx-auto">
          {/* Facebook Contact Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-8 sm:p-12 text-center text-white">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Liên Hệ Qua Facebook
            </h2>
            
            <p className="text-blue-100 mb-8 text-sm sm:text-base">
              Gửi tin nhắn trực tiếp cho chúng tôi trên Facebook để được hỗ trợ nhanh chóng. 
              Chúng tôi luôn sẵn sàng giải đáp thắc mắc của bạn!
            </p>

            <a 
              href="https://www.facebook.com/crypto.guru.to.the.moon" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
              Nhắn Tin Ngay
            </a>

            <div className="mt-8 pt-8 border-t border-blue-400">
              <p className="text-sm text-blue-100">
                <strong>@crypto.guru.to.the.moon</strong>
              </p>
              <p className="text-xs text-blue-200 mt-2">
                Thời gian phản hồi: Thông thường trong vòng 24 giờ
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              💡 Câu Hỏi Thường Gặp
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trước khi liên hệ, bạn có thể xem mục <a href="/privacy" className="text-primary hover:underline">Chính Sách</a> và <a href="/terms" className="text-primary hover:underline">Điều Khoản</a> để tìm câu trả lời nhanh nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

