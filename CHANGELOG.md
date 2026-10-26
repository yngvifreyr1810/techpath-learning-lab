# Ghi chú thay đổi TechPath

## 2026-10-27 — Python/API Foundations và không gian học

- Thêm 27 bài Python: sáu bài print/biến văn bản, tiếp theo là 21 bài cho bảy buổi luyện hai biến, int/float, f-string, đổi kiểu, phép cộng và ôn tổng hợp.
- Thêm 12 bài API nhập môn: GET, đường dẫn/HTTP status, query và POST JSON, với Request Builder và API mô phỏng không gọi dịch vụ ngoài.
- Tách Hiểu bài thành bốn trang ngang Mục tiêu, Kiến thức, Ví dụ, Đề bài; thực hành theo bố cục SQL, ba gợi ý mở dần và lời giải chủ động.
- Run hiển thị output hoặc lỗi gốc; Submit kiểm tra trên server, lưu snapshot và chỉ cho mở bài tiếp theo khi bản hiện tại đạt. Lỗi Python có tên lỗi, dòng/cột và liên kết tới editor khi có thông tin.
- Thêm gợi ý code không dùng AI và Undo/Redo cho SQL/Python, giữ lịch sử editor khi hiện kết quả. Tích hợp bản nháp, tiến độ, JSON backup/import và xuất bài làm cho Python/API.
- Chuyển vùng giữa sang nền OLED, thêm trăng/sao tĩnh và nút đóng/mở sidebar; giữ giao diện sidebar và gia sư.
- Giữ cập nhật model đã có trên GitHub khi hợp nhất nguồn webapp; không đưa phần Nhịp, cấu hình agent hay dữ liệu cá nhân cục bộ vào đợt này.
- Webapp cần bộ kết nối local đã cập nhật và khởi động lại ở cổng 4173 để Run/Submit Python/API. Nâng source hoặc refresh webapp không tự khởi động lại Node trên máy.
- Kiểm chứng bản hợp nhất: Python/API unit checks, UI offline (39 bài, bàn phím/Undo, responsive, backup/import và Markdown), build và MCP checks đều exit 0; không gọi AI hoặc chạy SQL Server. Rà 34 file staged không thấy khóa/secret nghi ngờ. Diff so với GitHub main không có lỗi khoảng trắng mới; diff hợp nhất với nguồn Sites còn cảnh báo khoảng trắng đã có trong provider-catalog.mjs của GitHub.

## 2026-10-24 — Đồng bộ phiên bản hiện tại lên GitHub

Các ghi chú dưới đây mô tả luồng hiện tại, được ưu tiên khi tài liệu lịch sử mô tả khác.

### Làm bài SQL

- **Run Code** chạy SQL và hiển thị kết quả/lỗi, không gọi AI.
- **Submit Code** chấm kết quả SQL, lưu bài nộp rồi gọi model gia sư đang chọn để nhận xét ngắn. Thao tác này có thể dùng quota của model/provider được chọn.
- Nhận xét AI dùng bản query và lựa chọn model được chụp lúc nộp. Lỗi AI không ghi đè kết quả chấm SQL.
- Khi Accepted, **Bài tiếp theo** nằm cạnh Submit Code. Sửa query sẽ ẩn nút cho đến khi bản hiện tại được nộp đạt.

### Ngữ cảnh và đáp án cho gia sư

- Ngữ cảnh được tạo theo yêu cầu, mức học, bảng liên quan, cấu trúc và dữ liệu mẫu của đúng bài. Bỏ đoạn mặc định đưa toàn bộ ba bảng SupportLab vào mọi bài.
- Quy tắc chung áp dụng cho SQL, Windows/Troubleshooting, Excel/Power BI và Portfolio/Interview: bám phạm vi bài, ưu tiên cách đơn giản, không tự thêm nghiệp vụ, bảng hoặc công cụ không cần thiết.
- Bộ kết nối lấy đáp án/cách làm tham khảo trực tiếp từ curriculum cho đúng lesson ID; hiện có 35/35 bài chuẩn có tham chiếu.
- Gia sư đối chiếu logic và kết quả, chấp nhận cú pháp tương đương; mặc định gợi ý từng bước, chỉ đưa toàn bộ đáp án khi được yêu cầu.
- Phân biệt bài chuẩn với bài chuyển giao. Không áp cứng đáp án/output bài chuẩn cho yêu cầu chuyển giao chưa có đáp án riêng.
- Lời AI cũ trong lịch sử là thông tin cần kiểm chứng; không dùng để thay đổi đề. Hạn chế checklist nội bộ hoặc nhãn thừa như “skipped”.

### Giao diện gia sư

- Gộp thông tin kết nối thành chấm xanh **Đang hoạt động** hoặc chấm đỏ **Chưa kết nối**; đây là trạng thái kết nối/danh mục, không bảo đảm mọi model còn quota.
- Thu nút làm mới thành biểu tượng ↻, bỏ các đoạn hướng dẫn lặp và ghi chú thừa cuối khung.
- Thu gọn phần đầu và ô nhập; lịch sử chat chiếm chiều cao còn lại. Hướng dẫn kết nối nằm trong mục có thể mở khi cần.

### Chat riêng và lựa chọn model

- Đồng bộ phần chọn model Copilot/Gemini/Local và danh mục workflow hiện có trong mã nguồn; model/quota thực tế phụ thuộc provider.
- Chat riêng hỗ trợ ảnh JPEG/PNG/WebP theo giới hạn kiểm tra phía client/server; chỉ chuyển ảnh sang kết nối có khả năng nhận ảnh được khai báo.
- Lịch sử/context chat riêng tách khỏi phần học. Các bộ xử lý Codex, Local và 9Router được cập nhật để chuyển nội dung/ảnh theo kết nối tương ứng.

### Địa chỉ và dữ liệu cục bộ

- Địa chỉ đang dùng: https://antechpath.creamyeft24.chatgpt.site.
- Bộ kết nối cho phép origin mới và giữ origin cũ để tương thích.
- Database cục bộ `data/`, dữ liệu `.techpath-local/`, file môi trường và bản sao lưu cá nhân không đưa lên GitHub.
- Việc push source không đồng bộ tiến độ học, lịch sử chat, database SQL, tài khoản hay cấu hình riêng của 9Router.

### Kiểm tra trong đợt đồng bộ

- Build bằng `node build.mjs`; không chạy bộ test hoặc gọi model/SQL để tránh tác động dữ liệu và quota.
- Các file kiểm tra có sẵn được lưu cùng source; việc có file kiểm tra không có nghĩa chúng đã được chạy trong đợt này.
- Các hướng dẫn/báo cáo model cũ không phải cam kết về khả năng gọi model hoặc quota hiện tại.
