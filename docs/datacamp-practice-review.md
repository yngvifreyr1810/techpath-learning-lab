# Tham khảo DataCamp và chỉnh workspace Python

Ngày 2026-10-29. Đọc nội dung công khai của 10 bài ở 4 chương cùng transcript Hello Python; bố cục phiên học tham khảo hai ảnh người dùng. Chưa đăng nhập hoặc thử chấm bài trong DataCamp. Không sao chép đề/lời giải/dataset của khóa học vào TechPath.

## Mẫu đã khảo sát

- [Variable Assignment](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-1-python-basics?ex=5): Điền phần thiếu, gán rồi in biến.
- [Calculations with variables](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-1-python-basics?ex=6): Tình huống quen thuộc, chia các bước tính và in.
- [Operations with other types](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-1-python-basics?ex=8): Dữ liệu có sẵn, kiểm tra kiểu và hành vi.
- [Create a list](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-2-python-lists?ex=2): Gom các biến vào danh sách.
- [Subset and conquer](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-2-python-lists?ex=6): Đọc phần tử với dữ liệu đã chuẩn bị.
- [Replace list elements](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-2-python-lists?ex=10): Sửa dữ liệu; tiếp nối tình huống bài trước.
- [Multiple arguments](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-3-functions-and-packages?ex=4): Chuỗi bước xử lý với nhiều chỗ cần hoàn thiện.
- [Selective import](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-3-functions-and-packages?ex=11): Dùng lại kiến thức và đổi cách import.
- [NumPy Side Effects](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-4-numpy?ex=4): Chọn đoạn code dựa trên hành vi/output.
- [Average versus median](https://campus.datacamp.com/courses/intro-to-python-for-data-science/chapter-4-numpy?ex=12): Khám phá thống kê bằng dữ liệu số.

## Đối chiếu và thay đổi

- Trước: đề dài, lặp hướng dẫn vận hành; gợi ý ở tab riêng; editor trống không có khung hỗ trợ.
- Sau: phần Bài tập gồm mục tiêu ngắn, kiến thức/ví dụ có thể mở tại chỗ; phần Hướng dẫn có các bước rõ; gợi ý cạnh yêu cầu; output kỳ vọng và quy tắc vẫn có trong mục mở rộng.
- Editor script.py và vùng Output / Kết quả kiểm tra có thanh nhãn riêng. Giữ thanh kéo chia vùng, Run/Submit/Dừng, chẩn đoán lỗi, lịch sử và OLED/sidebar/gia sư.
- Khung code tùy chọn cho bài print, biến và bài có dữ liệu starter. Điền ____ hoặc viết phần xử lý; không chèn vào bản nháp đã có. Ctrl+Z hoàn tác được. Bài checkpoint không cung cấp khung.
- Nguồn nội dung/chấm vẫn là TechPath. Giữ ID, nội dung kiến thức và tiến độ; không tự đưa NumPy, sửa list hoặc tham số hàm vào các tuần chưa triển khai.
- Các dạng khảo sát gồm hoàn thiện code, viết code từ dữ liệu sẵn, sửa dữ liệu, chuỗi nhiều bước, đọc hành vi/chọn đáp án. Đợt này áp dụng cấu trúc và khung hỗ trợ cho bài hiện có; chưa bổ sung toàn bộ dạng bài mới hoặc IPython Shell có trạng thái.

## Kiểm chứng

Lệnh tại thư mục dự án, dùng Playwright đã có qua NODE_PATH. Không gọi AI hoặc dịch vụ DataCamp.

- node checks-python-ui.mjs --offline: hồi quy Python/API, editor, Undo, nộp bài, backup/import và bốn trang lý thuyết.
- node checks-roadmap-ui.mjs: thêm kiểm tra chèn khung, Undo, không ghi đè draft, vị trí hai cột và mobile; giữ bộ kiểm tra lộ trình.
- node build.mjs; git diff --check.

Chưa deploy/commit/push. Chưa kiểm chứng tài khoản DataCamp, IPython tương tác hoặc SQL Server thật trong đợt này.

Kết quả cuối: checks-python-ui.mjs --offline, checks-roadmap-ui.mjs, node build.mjs và git diff --check đều exit 0. Đã xem ảnh desktop/mobile; giữ thanh kéo chia vùng và sửa độ giãn ví dụ ở màn hình thấp để bốn trang cũ không tràn. Preview 4191 đã khởi động, launcher exit 0.
