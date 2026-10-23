# SQL Challenge workspace

## Luồng học

- Đề bài: bối cảnh công việc, schema có kiểu dữ liệu, quy tắc, định dạng output, ví dụ và giải thích.
- Dữ liệu: đầy đủ dataset gốc của các bảng liên quan, không cần tải file hoặc mở SSMS.
- Gợi ý: mở từng ý; kiến thức nền và lời giải vẫn có trong mục mở rộng.
- Editor: T-SQL cố định, số dòng, tô màu cú pháp, Tab thụt dòng, tự lưu, Ctrl+Enter để Run.
- Run Code: thực thi query hiện tại, hiện bảng kết quả hoặc lỗi SQL Server. Không ghi nhận bài nộp.
- Submit Code: luôn chạy lại bản code gửi lên, đối chiếu bằng server, lưu snapshot và các kiểm tra. Không gọi AI.
- Lần nộp: xem code và kết quả cũ. Sau Accepted, bấm Bài tiếp theo khi đã xem xong; không điều hướng trước khi đọc kết quả.
- Ghi chú & hỏi gia sư: tùy chọn. Chỉ gọi AI khi bấm Hỏi gia sư.

## Chấm kết quả

`POST /api/sql/submit` dùng cùng session token và SQL lab như Run. Server tự chạy query tham chiếu trên chính database lab hiện tại; không tin output, đáp án hoặc trạng thái pass từ trình duyệt. So sánh tên/thứ tự cột, các giá trị và số lần xuất hiện của từng dòng. Chỉ bài CTE bắt buộc thứ tự dòng. NULL khác 0; observed_value phải là text.

Report chấp nhận các mô tả issue_type khác nhau nếu không rỗng; đối chiếu các trường còn lại. Severity tùy chọn ở sql-report, bắt buộc ở sql-proc và sql-params. Stored procedure được kiểm tra bằng lần EXEC độc lập và định nghĩa đã lưu. Bài tham số kiểm tra không tham số / High / Medium / Low.

Kết quả chỉ chứng minh đúng trên dataset lab hiện tại. **Chưa có bộ dữ liệu ẩn**, chưa đánh giá tính tổng quát hoặc hiệu năng query. Sample Input/Output trong đề là dataset gốc; nếu đã sửa dữ liệu lab, dùng SELECT để xem trạng thái thực tế. Phần SQL của bài debug được chấm kết quả, ticket vẫn cần review; bài chuyển giao chưa có bộ chấm tự động nên không tự đánh dấu hoàn thành.

Khi sửa code, kết quả cũ được đánh dấu. Để chuyển tiếp bằng nút trong kết quả, bản code hiện tại phải trùng một lần Submit đạt. Backup/import và Markdown journal giữ thông tin chấm SQL tách khỏi nhận xét AI. Điểm SQL đạt được gọi là `sql_pass`, không đánh dấu đã thành thạo độc lập.

## Files

- `dist/challenges.js`: public schema, seed rows, đề bài và samples cho 8 bài SQL.
- `dist/challenge.js`, `dist/challenge.css`: split workspace, editor và bảng kết quả.
- `sql-judge.mjs`: trusted result comparison, reference queries, procedure checks.
- `sql-lab.mjs`, `dist/sql.js`: Submit endpoint và client.
- `dist/app.js`: draft/history/progress/backup integration; giữ bộ lọc answers đã có.

Tham khảo hành vi Run/Submit: https://www.hackerrank.com/faq/how-to-debug-code/
