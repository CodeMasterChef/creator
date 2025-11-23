export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Điều Khoản Sử Dụng
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Cập nhật lần cuối: 23/11/2025
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Chấp Nhận Điều Khoản
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bằng cách truy cập và sử dụng website <strong className="text-primary">Thư Viện Tiền Số</strong>, 
              bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây. 
              Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Nội Dung Website
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Tất cả nội dung trên Thư Viện Tiền Số, bao gồm nhưng không giới hạn:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Bài viết tin tức</li>
              <li>Phân tích thị trường</li>
              <li>Hình ảnh, biểu đồ</li>
              <li>Logo và nhận diện thương hiệu</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              được cung cấp chỉ với mục đích thông tin và giáo dục. Nội dung được tổng hợp từ các nguồn bên ngoài 
              và có thể chứa liên kết đến các trang web của bên thứ ba.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Tuyên Bố Miễn Trừ Trách Nhiệm
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-gray-800 dark:text-yellow-200 font-semibold">
                ⚠️ QUAN TRỌNG: Không Phải Lời Khuyên Đầu Tư
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Thông tin trên website <strong>KHÔNG</strong> phải là lời khuyên tài chính, đầu tư, pháp lý hoặc thuế</li>
              <li>Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc sử dụng thông tin này</li>
              <li>Giá trị tiền điện tử có thể biến động mạnh. Bạn nên tự nghiên cứu kỹ trước khi đầu tư</li>
              <li>Luôn tham khảo ý kiến chuyên gia tài chính trước khi đưa ra quyết định đầu tư</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Quyền Sở Hữu Trí Tuệ
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Nội dung gốc trên website thuộc quyền sở hữu của Thư Viện Tiền Số. Bạn có thể:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>✅ Chia sẻ bài viết với ghi rõ nguồn</li>
              <li>✅ Trích dẫn ngắn cho mục đích phi thương mại</li>
              <li>❌ Sao chép toàn bộ nội dung mà không được phép</li>
              <li>❌ Sử dụng cho mục đích thương mại mà không có thỏa thuận</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Hành Vi Người Dùng
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Khi sử dụng website, bạn đồng ý KHÔNG:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Sử dụng website cho mục đích bất hợp pháp</li>
              <li>Phát tán virus, malware hoặc mã độc hại</li>
              <li>Cố gắng truy cập trái phép vào hệ thống</li>
              <li>Thu thập dữ liệu người dùng khác</li>
              <li>Đăng tải nội dung vi phạm pháp luật hoặc xúc phạm</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Liên Kết Bên Ngoài
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Website có thể chứa liên kết đến các trang web bên thứ ba. Chúng tôi không kiểm soát và không chịu 
              trách nhiệm về nội dung, chính sách bảo mật hoặc hoạt động của các website này.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Thay Đổi Điều Khoản
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi 
              được đăng tải trên website. Việc tiếp tục sử dụng website sau khi có thay đổi đồng nghĩa với việc 
              bạn chấp nhận các điều khoản mới.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Luật Áp Dụng
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết 
              tại tòa án có thẩm quyền tại Việt Nam.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Liên Hệ
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white">
                Email: <a href="mailto:legal@thuvientienso.com" className="text-primary hover:underline">legal@thuvientienso.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

