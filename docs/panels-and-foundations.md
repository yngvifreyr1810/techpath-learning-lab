# Bố cục tùy chỉnh và chặng ôn SQL

## Điều chỉnh khung làm bài

- Kéo đường dọc có chấm ở giữa đề bài và SQL Editor để chia lại độ rộng.
- Kéo đường ngang có chấm phía trên Run/Submit để đổi chiều cao editor và phần kết quả.
- Mở gia sư, kéo mép trái khung chat để đọc rộng hơn (tối đa 1000px, tùy màn hình).
- Có thể Tab đến thanh chia và dùng phím mũi tên. Nhấp đúp hoặc nhấn Home trên thanh chia để trả kích thước mặc định của khung đó.
- Nút **↺ Bố cục** khôi phục cả ba kích thước.

Kích thước lưu riêng trên trình duyệt hiện tại, không xóa khi đổi bài hoặc tải lại trang. Không nằm trong file backup tiến độ vì màn hình PC/laptop có thể khác nhau. Màn hình hẹp tự xếp hai khung bài làm theo chiều dọc; gia sư mở chồng lên nội dung để giữ diện tích đọc. Code và ghi chú không bị render lại trong lúc kéo.

## Ôn nền: 20 bài trước bài ứng dụng

1. SELECT trên Customers; SELECT trên Orders.
2. WHERE theo trạng thái; WHERE theo số tiền.
3. AND; OR; ORDER BY; TOP.
4. IS NULL; IS NOT NULL; tính cột bằng biểu thức; CASE.
5. COUNT; SUM; GROUP BY đếm; GROUP BY cộng payment.
6. HAVING; INNER JOIN; LEFT JOIN; điều kiện payment trong ON.

Mỗi bài khoảng 12–18 phút gợi ý, một yêu cầu nhỏ, có schema/dataset/output và gợi ý mở dần. Với buổi một giờ có thể làm 2–3 bài, dành thời gian tự giải thích và làm lại. Không cần học xong procedure rồi mới quay lại nền.

Bài mới được chèn trước các bài SQL cũ với ID riêng `sql-basic-*`. Giữ nguyên ID, draft, lịch sử và trạng thái các bài cũ. Trang tổng quan/thư viện có thẻ **Ôn lại SQL**; “Bài tiếp theo” sau bài SQL ưu tiên bài ôn nền còn chưa đạt/chưa bỏ qua. Vẫn có thể mở bất kỳ bài ứng dụng trong thư viện. Người dùng hiện tại không bị tự điều hướng hoặc thay code khi cập nhật.

Run/Submit dùng cùng SQL Server thật và bộ chấm kết quả hiện tại. Hai bài ORDER BY/TOP yêu cầu đúng thứ tự; các bài khác chấp nhận thứ tự dòng khác nhau. Chặng ôn chưa có dataset ẩn và không tự chứng nhận thành thạo chỉ bằng một lần pass.

## Files

- `dist/panels.js`, `dist/panels.css`: resize bằng pointer/keyboard, giới hạn theo màn hình và lưu kích thước.
- `dist/foundations.js`: 20 lesson, đề, sample, solution và thứ tự học; dataset giữ nguyên SupportLab.
- `curriculum.mjs`, `build.mjs`, `dist/index.html`: nạp lesson giống nhau ở local server, Site và MCP.
- `dist/app.js`, `dist/challenge.js`: chặng ôn, tiến độ, ưu tiên bài tiếp theo.
- `sql-judge.mjs`: kiểm tra thứ tự theo thuộc tính lesson.
