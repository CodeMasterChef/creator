export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Chính Sách Bảo Mật
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Cập nhật lần cuối: 23/11/2025
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Thu Thập Thông Tin
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Thư Viện Tiền Số cam kết bảo vệ quyền riêng tư của người dùng. Chúng tôi thu thập các thông tin sau:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Thông tin tự nguyện:</strong> Email, tên khi bạn đăng ký nhận tin hoặc liên hệ với chúng tôi</li>
              <li><strong>Thông tin tự động:</strong> IP address, trình duyệt, thời gian truy cập thông qua cookies</li>
              <li><strong>Thông tin tương tác:</strong> Các bài viết bạn xem, thời gian đọc</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Sử Dụng Thông Tin
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Thông tin thu thập được sử dụng để:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Cung cấp và cải thiện dịch vụ của chúng tôi</li>
              <li>Gửi thông báo tin tức và cập nhật (nếu bạn đăng ký)</li>
              <li>Phân tích xu hướng và tối ưu hóa trải nghiệm người dùng</li>
              <li>Bảo vệ website khỏi các hành vi gian lận</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Chúng tôi sử dụng cookies để:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Lưu trữ tùy chọn người dùng (theme, ngôn ngữ)</li>
              <li>Phân tích lưu lượng truy cập</li>
              <li>Cải thiện trải nghiệm người dùng</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến trải nghiệm sử dụng.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Chia Sẻ Thông Tin
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Chúng tôi <strong>KHÔNG</strong> bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. 
              Thông tin chỉ được chia sẻ khi:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Có sự đồng ý của bạn</li>
              <li>Theo yêu cầu pháp luật</li>
              <li>Bảo vệ quyền lợi của chúng tôi và người dùng khác</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Bảo Mật
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Chúng tôi áp dụng các biện pháp bảo mật phù hợp để bảo vệ thông tin của bạn khỏi truy cập trái phép, 
              thay đổi, tiết lộ hoặc phá hủy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Quyền Của Bạn
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bạn có quyền:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Truy cập và cập nhật thông tin cá nhân</li>
              <li>Yêu cầu xóa thông tin</li>
              <li>Từ chối nhận email marketing</li>
              <li>Khiếu nại về cách chúng tôi xử lý dữ liệu của bạn</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Liên Hệ
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white">
                Email: <a href="mailto:privacy@thuvientienso.com" className="text-primary hover:underline">privacy@thuvientienso.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

