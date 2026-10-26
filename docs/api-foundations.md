# API Foundations

12 bài, 4 nhóm × 3 bài. Theo hướng tiếp cận của [freeCodeCamp APIs for Beginners](https://www.freecodecamp.org/news/apis-for-beginners), [Postman quick start](https://learning.postman.com/docs/getting-started/quick-start/) và [MDN HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview). Nội dung tiếng Việt, ví dụ và bài tập được soạn riêng; không sao chép course.

| Nhóm | Ba bài luyện |
| --- | --- |
| GET và request/response | Lời chào, thông tin mẫu, chủ đề học |
| Đường dẫn và trạng thái | Sách ID 1, sách ID 2, sách không tồn tại (404) |
| Query parameter | Lọc sách Python, SQL, API |
| POST JSON | Ba ghi chú với nội dung khác nhau |

Hiểu bài có Mục tiêu, Kiến thức, Ví dụ, Đề bài như Python. Thực hành theo bố cục SQL: đề/gợi ý/lịch sử bên trái, Request Builder và response bên phải. Chọn method, nhập đường dẫn, Content-Type và body. Chạy chỉ hiển thị HTTP status, headers và JSON body; Nộp bài kiểm tra request, HTTP status và JSON body trên server. Thứ tự key hoặc khoảng trắng trong JSON không quyết định đúng/sai. Chỉ hiện bài tiếp theo sau lần nộp đạt của request hiện tại. Không tự chuyển bài.

Đây là API **mô phỏng**, không gọi website ngoài, không cần tài khoản hay API key, không ghi dữ liệu thật. Mỗi lần chạy dùng cùng dữ liệu ban đầu. HTTP 404 có thể là đáp án đúng khi đề yêu cầu nhận biết tài nguyên không tồn tại. Các lỗi ví dụ: BOOK_NOT_FOUND, ENDPOINT_NOT_FOUND, INVALID_JSON, MISSING_TITLE, UNSUPPORTED_MEDIA_TYPE. Không nhận URL tuyệt đối hoặc host ngoài.

Endpoints điều khiển lab: GET `/api/practice-api/status`, POST `/api/practice-api/run`, POST `/api/practice-api/submit`. Dùng origin/host checks của server local và token riêng. Giới hạn request 64 KiB. Không nhận verdict do trình duyệt gửi. GET/POST trong Request Builder là request **bên trong mô phỏng**, phân biệt với các endpoint điều khiển này.

Kết quả lưu trường bổ sung `apiJudging`, assessment `api_pass`/`api_retry`; bản nháp, backup/import v1, tiến độ, tải request JSON và xuất Markdown cùng giữ dữ liệu SQL/Python cũ. Undo/Redo áp dụng ô đường dẫn và body trong phiên trang. Không thay đổi sidebar hoặc gia sư, không gọi inference.

## Preview và kiểm chứng

Mở `Start-Foundations-Preview.cmd` để chạy bản mới ở cổng 4190. Nếu đã có dữ liệu ở cổng 4189, Sao lưu JSON tại 4189 rồi Import ở 4190; hai origin không tự chia sẻ localStorage. Bản đang chạy cũ cần khởi động lại để nhận bộ bài/chấm server mới; tải lại trình duyệt chỉ cập nhật phần giao diện.

Kiểm chứng offline dùng server test tạm thời chỉ có static assets và hai lab, không có route gia sư/provider: `node checks-python-ui.mjs --offline`. Không phải kiểm chứng tiến trình production đang chạy. Xem thêm `node checks-api.mjs`, `node checks-python.mjs`, `node build.mjs`, `node checks-mcp.mjs`, `git diff --check`.

Kết quả 2026-10-26: `node checks-python.mjs`, `node checks-api.mjs`, `node checks-python-ui.mjs --offline`, `node checks-python-ui.mjs --offline --api-only`, `node build.mjs`, `node checks-mcp.mjs`, `node --check` cho app.js/api.js/python.js/server.mjs/api-lab.mjs/python-lab.mjs và `git -c core.safecrlf=false diff --check` đều exit 0. UI test kiểm tra cả export/import JSON và Markdown, giữ mẫu SQL/Python cũ cùng 12 kết quả API. Bản đầu của test phát hiện nội dung API tràn trang; đã rút gọn phần giải thích GET và JSON mẫu, sau đó kiểm tra lại đạt.

Chưa kiểm chứng: launcher bằng thao tác người dùng, tiến trình production với code mới, gia sư, SQL Server, publish/reboot. Tự động restart preview cũ và mở preview nền mới bị approval review chặn với thông báo `blocked by policy`; không đổi cách để dừng tiến trình đó. Dùng script preview do người dùng tự mở. Không commit/push/deploy hoặc cài dependency.
