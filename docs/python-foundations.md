# Python Foundations — khởi đầu và một tuần luyện tiếp

## Phạm vi

27 bài Python: giữ nguyên sáu bài đầu và thêm 21 bài cho bảy buổi tiếp theo, mỗi buổi ba bài nhỏ khoảng 20–30 phút. Mỗi bài có lý thuyết, tác dụng thực tế, ví dụ có giải thích trước, yêu cầu/output, editor trống, ba gợi ý và lời giải mở chủ động. Giữ ID và tiến độ các bài cũ. Chưa hỗ trợ input(). API có nhóm riêng, xem api-foundations.md.

| Buổi | Kiến thức và ba bài thực hành |
| --- | --- |
| 1 | Hai biến: tên/nơi ở, món ăn/đồ uống, chủ đề/nơi học |
| 2 | int: quyển vở, phút học, số trang |
| 3 | float: quãng đường, nước uống, nhiệt độ |
| 4 | f-string: lời chào, phút học, đi bộ |
| 5 | int(text): quyển vở, phút học, số trang |
| 6 | Phép cộng: vở mua thêm, hai buổi học, hai quãng đường |
| 7 | Ôn cũ, không thêm cú pháp: trái cây, đọc sách, đi bộ |

Tham khảo [Bro Code](https://www.youtube.com/watch?v=ix9cRaBkVe0), các chương Variables (00:05:49), Type casting (00:16:05), Arithmetic & math (00:37:55). Bài được soạn riêng, chia nhỏ hơn course. Đợt này chưa đi qua user input, madlibs, if hay vòng lặp. Đây là bảy **buổi học**, không ép theo ngày lịch; có thể xen các buổi SQL/API trong quỹ thời gian phù hợp.

Bài mới kiểm tra output và yêu cầu kiến thức qua AST: biến/giá trị/kiểu ban đầu và các đặc điểm f-string, int(), phép cộng phải góp phần tạo output. Không chạy lại code người học khi phân tích. Chỉ nhận cấu trúc gán và print thẳng từ trên xuống trong nhóm mới; đây là kiểm tra cho bài nhập môn, không phải bộ chứng minh tính đúng đắn của mọi chương trình Python. Bài chỉ in sẵn đáp án hoặc đặt cách làm trong code không chạy sẽ chưa đạt.

| ID | Mục tiêu |
| --- | --- |
| `python-basic-print` | Bài print() đã có, giữ output và dữ liệu cũ |
| `python-print-message` | Luyện một thông báo khác |
| `python-print-lines` | Hiển thị SQL, Python, API trên ba dòng theo thứ tự |
| `python-variable-name` | Gán và đọc biến name |
| `python-variable-status` | Luyện lại với biến status |
| `python-variable-topic` | Luyện lại với biến topic |

Mỗi nhóm có nhãn 1/3–3/3. Nộp đạt không điều hướng tự động; nút tiếp theo mở trang Hiểu bài của bài luyện kế tiếp. Sau nhóm print mới có nút mở phần biến. Sửa code sẽ ẩn nút tiếp của kết quả cũ. Bài cuối nhắc kết thúc nhóm luyện để quay về lý thuyết nền tảng AI Engineer. Tác dụng thực tế là bối cảnh minh họa, không tuyên bố chương trình mẫu đã thực hiện kết nối mạng/xử lý dữ liệu.

### Hai trang học và thực hành

- `#lesson/python-basic-print`: bốn trang ngang **Mục tiêu → Kiến thức → Ví dụ → Đề bài**, mỗi trang vừa vùng hiển thị. Thanh chuyển trang và nút **Bắt đầu làm bài** luôn hiện; chọn trang bằng nút bước, Trước/Tiếp hoặc phím trái/phải. Ví dụ hai lệnh thay nội dung ngay trong trang Ví dụ, không mở dài xuống dưới. Không editor, gợi ý hoặc kết quả trên trang đọc.
- `#lesson/python-basic-print/practice`: workspace theo bố cục SQL, đề/gợi ý/lần nộp bên trái; editor có số dòng, tô màu, gợi ý nhập liệu và kết quả bên phải. Có link quay lại lý thuyết, tải `.py`, lần thử mới, Run/Submit/Stop, mở rộng và các thanh resize dùng chung với SQL. Màn hình hẹp xếp dọc; đề và kết quả cuộn riêng.
- Chuyển giữa hai trang/tab lưu draft trước khi render. Reload URL thực hành vẫn mở đúng workspace. Không đổi schema lưu trữ hoặc backend Python.
- Kiểm tra lại sau thay đổi: `node checks-python.mjs`, `node checks-python-ui.mjs` (với NODE_PATH như dưới), `node build.mjs`, `node checks-mcp.mjs`, `git diff --check`: exit 0. UI kiểm tra không editor/gợi ý trên trang đọc, nút bắt đầu, quay lại không mất code, tab gợi ý/lần nộp và resize bằng phím, cùng các trường hợp hồi quy đã liệt kê dưới. Không chạy lại hai bộ cũ đang lỗi ngoài phạm vi; không gọi AI, SQL Server hoặc deploy.
- Kiểm tra phân trang: cả bốn trang và ví dụ mở rộng không tràn chiều cao tại 1440×1000, 1366×768, 1280×600, 390×844 và 390×667; nút bắt đầu luôn trong viewport. Ở kích thước cực nhỏ/zoom lớn, vùng nội dung vẫn cho cuộn để không cắt mất chữ; không khóa cuộn bằng cách giấu nội dung.

Run chỉ chạy; Submit chạy lại và lưu snapshot vào `pythonJudging`, tách khỏi SQL judging và AI review. Đạt không tự chuyển bài hoặc chứng nhận thành thạo. Output được so sánh đúng chữ, khoảng trắng và số dòng, chỉ chuẩn hóa CRLF và bỏ một newline cuối. Backup v1 đọc được trường bổ sung; bản app cũ chưa có bài Python không giữ được dữ liệu bài mới khi nhập, nên dùng bản app đã cập nhật.

Autocomplete không dùng AI hoặc đáp án: Python gợi ý `print` và tên biến đã gán trong code; SQL gợi ý từ khóa và bảng/cột trong schema bài, gồm alias đơn giản từ FROM/JOIN. Đây là phân tích văn bản nhẹ, chưa phải bộ phân tích ngôn ngữ đầy đủ hoặc IntelliSense cho mọi cấu trúc SQL/Python. Tab nhận, mũi tên chọn, Esc đóng, Ctrl+Space gọi lại; Tab thường thụt dòng, Shift+Tab cho phép rời editor. Không gợi ý trong comment/chuỗi thông thường.

## Chạy local

Chạy `Start-TechPath.cmd` như thường lệ sau khi khởi động lại connector để nạp backend mới, rồi mở `http://127.0.0.1:4173/#lesson/python-basic-print`. Bản cập nhật sáu bài dùng preview `http://127.0.0.1:4189/#lesson/python-print-message`. Preview cũ 4188 chưa được khởi động lại vì thao tác dừng bị policy chặn; không dùng backend cũ để chạy bài mới. Tiến độ trình duyệt tách theo địa chỉ/cổng; muốn mang tiến độ từ 4188 sang 4189, xuất JSON ở địa chỉ cũ rồi nhập ở địa chỉ mới. Không có triển khai lên Site.

## Chấm bài theo nội dung

Server lấy output và tên biến bắt buộc từ curriculum theo lesson ID, bỏ qua mọi đáp án/kết luận client tự gửi. Bài biến kiểm tra output và AST bằng thư viện ast của Python: cần phép gán ở cấp chương trình trước một lời gọi print đọc trực tiếp tên biến được yêu cầu. Chấp nhận nháy đơn/kép và ngoặc phụ; không tính comment, chuỗi mô tả code, biến không được đọc hoặc nhánh không thực thi là bằng chứng. Đây là kiểm tra cho bài cơ bản, không phải bộ xác minh ngữ nghĩa Python tổng quát. Run không chấm; Submit mới kiểm tra và lưu.

Kiểm chứng cập nhật: `node checks-python.mjs`, `node checks-python-ui.mjs` (Playwright từ runtime, mặc định preview 4189), `node build.mjs`, `node checks-mcp.mjs`, `git diff --check`: exit 0. Build có 41 bài. UI thử toàn bộ chuỗi 6 bài không tự điều hướng, ba trường hợp in literal bị từ chối ở bài biến, lưu/đọc lại draft và kết quả, mẫu thực tế, 4 trang kiến thức ở 1366×768, 1280×600 và 390×667. Không gọi AI, không chạy SQL, chưa commit/push/deploy/cài dependencies. Các kết quả bên dưới là kiểm chứng đợt đầu một bài.

Backend gọi `py -3 -I -S -X utf8 -c`, tiến trình mới, không qua shell, stdin đóng, timeout 5 giây và tổng stdout/stderr tối đa 64 KiB. Các tiến trình chạy dưới tài khoản Windows hiện tại, không phải sandbox bảo mật. Thư mục làm việc nằm trong `.techpath-local/python-lab/`. Ba endpoint `/api/python/status`, `/api/python/run`, `/api/python/submit` dùng kiểm tra host/origin của server và token cho POST; đáp án và kết luận chấm nằm ở server.

## Kiểm chứng ngày 2026-10-26

Các lệnh sau exit **0**:

- `node checks-python.mjs`: Python thật, Unicode, hai kiểu dấu nháy, so sánh output, lỗi cú pháp, input không hỗ trợ, timeout, giới hạn output, thiếu runtime và hủy; kiểm tra nguồn gợi ý Python/SQL.
- `node checks-python-ui.mjs` với Playwright có sẵn trong runtime và `NODE_PATH` trỏ tới thư mục packages: Edge headless, desktop/mobile, Tab/Esc/thụt dòng, SQL alias, Run/Submit, đổi code/reload, Stop, tách draft, backup/import giữ cả Python và SQL fixture, Markdown. Không request inference.
- `node build.mjs`: 22 assets, 36 lessons.
- `node checks-mcp.mjs`: Worker/MCP và asset Python/completion mới.
- `node --check` cho `python-lab.mjs`, `server.mjs`, `build.mjs`, `dist/app.js`, `dist/python.js`, `dist/python-content.js`, `dist/completion.js`.
- `git diff --check`.

Hai bộ cũ exit **1**: `node checks.mjs` thiếu mock `document.body.classList`; xác nhận cùng lỗi khi dùng app.js từ HEAD trong `.techpath-local/baseline-checks.mjs`. `node checks-tutor.mjs` yêu cầu context nhỏ hơn 6500 ký tự trong khi prompt hiện có dài hơn; tutor-context.mjs không đổi so với HEAD. Không sửa hai vấn đề ngoài phạm vi này.

Không chạy SQL Server, inference AI, kiểm tra reboot hoặc Site đã publish. Các phép thử trình duyệt dùng profile tạm, không nhập/thay thế tiến độ thực của người học. Bốn file provider/router đã có thay đổi trước phiên giữ nguyên SHA256; phần Nhịp trong server được giữ lại. Chưa commit, push, deploy hay cài dependencies.

## Kết quả bài làm đồng bộ với SQL

Python dùng cùng bố cục và CSS kết quả SQL: Run Result / Submission Result, Accepted / Chưa đạt, thời gian chạy, danh sách kiểm tra và chi tiết output. Run không ghi nhận đạt. Submit vẫn dựa vào kết luận từ server; kết quả cũ và backup giữ tương thích.

Run chỉ hiện Output (stdout) nếu chương trình chạy không lỗi; stdout rỗng ghi “(Không có output)”. Nếu gặp lỗi, hiện Compiler Message với stderr gốc, loại lỗi, dòng/cột và exit code nếu có; giữ stdout đã in trước khi lỗi. Không có bảng kiểm tra hoặc kết luận đạt/chưa đạt ở Run. Ví dụ `print` là biểu thức hợp lệ nhưng không gọi hàm: Run không lỗi và không có output, Submit vẫn Chưa đạt vì thiếu output. Có kiểm tra hồi quy backend và trình duyệt cho trường hợp này.

Lỗi hiển thị tên lỗi Python gốc (SyntaxError, NameError, IndentationError…), dòng và cột nếu Python cung cấp, exit code và toàn bộ stderr. Nút đến dòng lỗi đưa con trỏ vào editor; khi code đã thay đổi thì vị trí cũ không được áp dụng. Không tự đặt mã lỗi số cho Python. Lỗi kết nối hoặc dừng chạy cũng hiện trong vùng kết quả, không tạo lần nộp giả.

Giữ phần làm bài SQL làm chuẩn cho các bài ngôn ngữ tiếp theo. Nội dung kiểm tra và thông báo lỗi theo ngôn ngữ, giữ cùng cách trình bày kết quả.

Editor SQL/Python có Ctrl+Z hoàn tác, Ctrl+Y hoặc Ctrl+Shift+Z làm lại. Lịch sử tối đa 100 trạng thái mỗi bài, giữ trong phiên trang kể cả sau Run/Submit, đổi tab hoặc quay lại bài; bao gồm Tab gợi ý, thụt dòng, xóa và nhập code. Sửa mới sau Undo sẽ bỏ nhánh Redo cũ. Bản nháp vẫn tự lưu; lịch sử Undo không lưu qua tải lại trang hoặc đưa vào backup. Kiểm thử trình duyệt dùng phím thực cho cả hai editor và kiểm tra Undo/Redo sau Python Run/Submit.

Kiểm chứng bổ sung: checks-python-ui.mjs thử thiếu ngoặc, thiếu dấu phẩy giữa chuỗi và số, NameError, IndentationError; chuỗi liền nhau hợp lệ vẫn chạy; kiểm tra nút tới dòng lỗi, tab kiểm tra, lưu lỗi và tải lại. Dùng profile tạm, không gọi gia sư.
