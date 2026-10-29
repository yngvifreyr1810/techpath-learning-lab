# AI Engineer 12 tuần — đợt 1 (2026-10-29)

## Đã bàn giao local

- Bản đồ 12 tuần, đích đến sau tuần 8/12, trình độ thực tế và hướng học tiếp; 45–60 phút/buổi, 6 buổi/tuần, 54–72 giờ dự kiến.
- Tuần 1–3 có 18 buổi; 5 bài hiểu AI/môi trường/module/JSON, 27 bài Python mới (18 bài luyện và 9 bài vận dụng kiểm tra cuối tuần), 3 bộ kiểm tra 5 câu.
- Tổng thư viện: 106 bài (74 bài cũ giữ nguyên ID + 32 bài mới). Bài Python/API/SQL Foundations cũ được ánh xạ vào buổi hoặc mục ôn thêm; không bắt học lại để xóa tiến độ cũ.
- Tuần 4–12 ghi Sắp có; chưa có buổi/bộ chấm cho các tuần đó. Bài POST cũ vẫn có trong thư viện và được liên kết ôn thêm ở tuần 6, không biến cả tuần 6 thành chặng đã hoàn thiện.
- Bộ kiểm tra kiến thức không gọi AI. Chọn ít nhất 4/5 câu đúng và nộp đạt cả 3 bài vận dụng mới đủ vượt kiểm tra tuần; một đáp án sửa chưa kiểm tra lại hoặc bản code đang sửa không dùng để chứng nhận bản hiện tại.
- Các bài SQL được ánh xạ vào lộ trình không tự gọi nhận xét AI sau Submit. Người học vẫn có thể chủ động hỏi gia sư; bộ chấm SQL cũ giữ nguyên. Kiểm tra hành vi không gọi AI dùng SQL fixture trong UI, không chạy SQL Server thật.
- Đã đọc là xác nhận chủ động sau khi xem 4 trang. Đã kiểm tra lại dựa trên bài biến thể có `reviewOf`, lần làm đạt ở ngày sau, không mở gợi ý/lời giải trong lần đó. Không khẳng định không có trợ giúp ngoài app hoặc đã thành thạo.

## Dùng thử

Chạy `Start-Roadmap-Preview.cmd`, hoặc:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Start-Roadmap-Preview.ps1 -NoOpen
```

Mở http://127.0.0.1:4191/#roadmap. Launcher chỉ tạo preview nếu cổng trống; không dừng connector khác, đổi provider hoặc gọi AI. Cổng này có localStorage riêng: xuất Sao lưu ở địa chỉ đang học rồi nhập trong preview nếu muốn dùng tiến độ cũ. Import hiện có bước tải bản sao trước khi thay dữ liệu.

Giao diện và nguồn gia sư hiện có được giữ. Run/Submit của bài học mới không dùng hạn mức gia sư. Phần gọi LLM thật thuộc đợt 3 và chưa triển khai.

## Nguồn và nội dung

- https://github.com/rohitg00/ai-engineering-from-scratch — Setup & Tooling, Python for AI Engineering, APIs & Keys; các phase math/ML/LLM là nguồn định hướng cho chặng sau.
- https://roadmap.sh/ai-engineer — bản đồ đích đến, không phải toàn bộ nội dung bắt buộc trong 12 tuần.
- Nội dung mới được viết tiếng Việt và chia nhỏ cho người mới; có nhãn Chuyển soạn/Bài luyện bổ sung, liên kết nguồn. Bài Bro Code cũ giữ nguồn của bài cũ.
- Bốn trang hiểu bài; ví dụ được giải thích trước bài tập. Thư viện cũ Application Support/BI vẫn truy cập được qua `#roadmap/library`.

## Giao diện dữ liệu / backend

- `TECHPATH.roadmap`: phiên bản, tuần, buổi, prerequisites, nguồn, mục tiêu, bài có thể học và liên kết ôn thêm. Bài lý thuyết dùng kind=knowledge, contentVersion; bài Python thêm roadmapCases và reviewOf.
- Trường cộng thêm `learning` trong backup v1: reads, drafts (lựa chọn/ghi chú/câu hỏi), attempts có phiên bản nội dung và kết quả từng câu. Không đổi ID hoặc cấu trúc dữ liệu SQL/Python/API cũ. Markdown có phần lộ trình và kết quả lý thuyết.
- `GET /api/learning/status`, `POST /api/learning/check {id, answers}`: token riêng, origin/Host kiểm tra ở server; JSON tối đa 16 KiB. Server chọn câu hỏi/đáp án từ curriculum, không nhận kết luận đạt của client. Quiz là luyện tập, không phải hệ thống thi chống gian lận; đáp án soạn sẵn cũng có trong nguồn curriculum.
- Server chỉ chấm phần câu hỏi. Điều kiện chặng kết hợp kết quả quiz và các bản nộp thực hành trên thiết bị; dữ liệu backup là dữ liệu học cá nhân, không phải chứng chỉ có chữ ký server.
- Python cũ giữ bộ chấm. Python mới chạy code gốc trước, rồi dùng AST để thay riêng các phép gán đầu vào theo 3 fixture công khai. Chấp nhận cách giải khác nếu trả đúng các trường hợp. Tên biến đầu vào theo đề; mỗi tên gán riêng một lần ở cấp chương trình. Không nhận fixture từ trình duyệt.
- Mỗi tiến trình vẫn giới hạn 5 giây/64 KiB; một lần Submit gồm nhiều tiến trình thử. Dừng hủy chuỗi kiểm tra. Không coi đây là sandbox bảo mật; không tuyên bố chứng minh đúng cho mọi đầu vào hoặc chống được mọi cách cố tình vượt bộ chấm.
- `pythonJudging` lưu thêm cases/contentVersion. Kết quả hiện từng bộ dữ liệu, output thực tế/mong đợi; Run không tạo lần nộp. Lỗi Python gốc vẫn hiện stderr và vị trí.
- Ngữ cảnh sang Chat chỉ lấy bài hiện tại và hai ô người học tự nhập; không lấy token, cấu hình provider, không gian riêng hoặc lịch sử gia sư. Chỉ sao chép, không tự gửi sang chat khác.

## Kiểm chứng

Chạy tại thư mục dự án, không gọi inference. Playwright dùng runtime đã có, không cài package:

```powershell
node checks-roadmap.mjs
$env:NODE_PATH='C:/Users/Vinha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node checks-roadmap-ui.mjs
node checks-python.mjs
node checks-api.mjs
node checks-python-ui.mjs --offline
node build.mjs
node checks-mcp.mjs
git diff --check
```

Các kiểm tra này đã exit 0 trong đợt 1. Backend mới kiểm tra toàn bộ 27 lời giải mới, hardcode output, lỗi cú pháp/thụt dòng, giá trị biên, cách giải khác và hủy. Bộ cũ kiểm tra timeout/output, tiếng Việt và autocomplete. UI offline kiểm tra tiến độ, 4 trang, kết nối lỗi không mất đáp án, snapshot, Undo, ngưỡng checkpoint, backup/import và Markdown ở bộ hồi quy.

Chưa kiểm chứng SQL Server thật, inference gia sư/LLM, triển khai webapp/GitHub hoặc khởi động lại máy. Các file provider/Nhịp có thay đổi sẵn được giữ; server.mjs chỉ thêm import và dispatch learningRoute với xác nhận của người dùng. Chưa commit, push, deploy hoặc cài dependency.

Launcher preview đã chạy exit 0 tại cổng 4191. Kiểm chứng HTTP trên preview thật: quiz đạt, Python 3.14.5 nộp bài if/else đạt cả 3 fixture; Origin webapp được nhận, Origin lạ và Origin Nhịp bị từ chối ở route learning. Không ghi kết quả này vào tiến độ trình duyệt của người học.

## Tiếp theo sau khi người học dùng thử

Đợt 2: tuần 4–6, vòng lặp/hàm, tệp UTF-8/JSON/CSV, lỗi và Python gọi API lab; thư mục chạy riêng mỗi lần và dữ liệu đầu vào/tệp mẫu. Đợt 3: tuần 7–9, toán trực quan/ML và thực hành mô hình theo nguồn gia sư đã chọn. Đợt 4: tuần 10–12, trợ lý ghi chú và 10 tình huống kiểm chứng. Không mở nhãn Có thể học khi chưa có nội dung và bộ kiểm tra tương ứng.
