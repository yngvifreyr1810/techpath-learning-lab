# Không gian trò chuyện riêng

Mở Cài đặt → Không gian riêng → Mở không gian trò chuyện. Nút Nhật ký được bỏ khỏi thanh bên. Tải lại trang hoặc rời không gian riêng sẽ đóng lối vào; đây là sự kín đáo trong giao diện, không phải xác thực hay mã hóa.

## Ngữ cảnh và dữ liệu

- Mặc định là lắng nghe, nói về cuộc sống và tâm sự; có thể chọn cùng gỡ rối hoặc lên kế hoạch.
- Hồ sơ có sẵn vài nét An đã chia sẻ, được xem/sửa/xóa trong “AI nên biết về mình”. Hồ sơ này được gửi cùng tin nhắn khi người dùng bấm Gửi.
- Mỗi cuộc chat có lịch sử riêng. Đổi model trong cùng cuộc chat dùng chung các lượt gần đây, tối đa 12 tin và có giới hạn độ dài. Không phải trí nhớ đầy đủ vô hạn.
- Không gửi code SQL, điểm, nhận xét, ghi chú học tập hoặc lịch sử gia sư sang cuộc chat cá nhân.
- Trình duyệt lưu dữ liệu ở `techpath.personal.v1`. Không nhúng vào sao lưu học tập, MCP widget state hoặc Git. Xuất/nhập JSON riêng để chuyển PC/laptop hoặc chuyển bản Site/local.
- Nội dung học cũ vẫn nằm trong dữ liệu học; có thể xuất từ Cài đặt → Xuất lịch sử học cũ Markdown.
- Cất cuộc chat là thao tác có thể khôi phục. Không có nút xóa vĩnh viễn ở phiên bản này.

## AI

Local AI là mặc định. Ngoài ra có Gemini CLI chính thức, techpath-light, Codex và Gemini trong danh mục 9Router khi làm mới AI. Chỉ Local AI trực tiếp bảo đảm không chuyển sang cloud. Các route khác gửi nội dung riêng đến nhà cung cấp tương ứng; cấu hình 9Router quyết định chuỗi fallback.

### Gemini CLI

1. Máy hiện tại đã cài `@google/gemini-cli@0.65.0` trong thư mục `.techpath-local/gemini-runtime` được Git bỏ qua.
2. Bấm Đăng nhập Gemini trong không gian riêng, tự đăng nhập Google ở cửa sổ vừa mở. Hoặc chạy `Setup-GeminiChat.cmd` (máy mới sẽ cài package trước).
3. Đóng cửa sổ đăng nhập, chọn Gemini CLI, bấm Làm mới AI rồi gửi tin nhắn.

Đây là hạn mức Gemini CLI/Code Assist của tài khoản đủ điều kiện, không phải cam kết dùng chung quota của Gemini Web. Không lấy cookie trình duyệt và không dùng API key để tính tiền theo lượt. AI Pro/Ultra có quyền lợi CLI theo tài liệu hiện hành của Google.

Adapter dùng home/work riêng dưới `.techpath-local/gemini-chat`; tắt extensions, hooks, telemetry và context file, dùng system prompt cá nhân và deny-policy cho công cụ. CLI có thể lưu phiên/cache trong thư mục riêng này; không đưa thư mục đó lên Git hay chia sẻ bản sao cho người khác. Đăng nhập hết hạn, quota hoặc cập nhật CLI có thể cần thiết lập lại. Không tự fallback sang provider khác hay tự gửi lại khi lỗi.

Nguồn: https://geminicli.com/docs/get-started/authentication/ và https://geminicli.com/docs/resources/quota-and-pricing/
