# TechPath — Personal Learning Lab

## SQL lab và AI đánh giá (v0.4 — luồng hiện tại)

1. Mở `Start-TechPath.cmd` trên Windows. Cần SQL Server Express tại `localhost\SQLEXPRESS` để chạy SQL. AI dùng Codex đã đăng nhập bằng ChatGPT hoặc 9Router/Antigravity (Gemini, Claude, GPT-OSS); chỉ cần một trong hai. Laptop cần cài SQL Server Express riêng; tiến độ chuyển bằng JSON.
2. Bài học → **Thực hành** → viết query trong app → **Chạy SQL** hoặc **Ctrl+Enter**. Kết quả nhiều bảng, NULL và lỗi kèm dòng xuất hiện ngay bên dưới. Hỗ trợ GO trên dòng riêng, CTE, CREATE OR ALTER PROCEDURE, EXEC và sys.sp_helptext. Chạy SQL không gọi AI hoặc tiêu hao hạn mức model.
3. Bấm **Review & đánh giá**. Nếu code mới chưa chạy, app chạy trước rồi gửi kết quả và rubric của bài cho AI. Đạt thì lưu nhận xét/tối ưu và tự mở bài tiếp theo. Chưa đạt hoặc thiếu bằng chứng thì giữ bài, cho một gợi ý nhỏ. Nếu bạn nhập câu hỏi ở ô **Chỗ mình muốn hỏi review**, kết quả có thêm mục **Giải thích phần bạn hỏi**; mục này được lưu trong nhật ký, bản sao lưu JSON và xuất Markdown. Hỏi tiếp trong khung gia sư không tự chấm hay chuyển bài.
4. **Bỏ qua bài** lưu bản làm hiện tại và mở bài khác; không tính là đạt. Thư viện có bộ lọc **Đã bỏ qua** để quay lại. Nhật ký lưu kết quả, tiêu chí và nhận xét. Tab tự kiểm tra và các nút tự xác nhận đã được bỏ.

Kết quả là **AI xác nhận đạt bài thực hành**, không phải chứng nhận kỹ năng độc lập. App không tự chạy SQL ở môi trường công ty. Database `TechPathLab_<id>` do app tạo có cùng 6 customers, 8 orders, 5 payments như SupportLab, tách khỏi database SupportLab cũ. `USE SupportLab` trên dòng riêng được ánh xạ vào lab để dùng được code đã học. Mỗi máy có lab riêng; dữ liệu SQL/procedure trên máy không tự đồng bộ theo JSON.

Phần v0.2 bên dưới ghi lại nền tảng MCP cũ; luồng v0.4 ở trên được ưu tiên khi có khác biệt.

## Gia sư trực tiếp (v0.3, cập nhật v0.4)

1. Trên Windows, mở `Start-TechPath.cmd` trong thư mục project. Cần Node.js 20+ và một trong hai: Codex đã đăng nhập bằng ChatGPT, hoặc 9Router đang chạy ở cổng `20128` với Antigravity. Bộ khởi động tìm Codex CLI hoặc bản đi kèm desktop app.
2. Mở bài, nhập code/kết quả/suy luận/câu hỏi rồi bấm **Nhờ review**. App đọc các ô đó và trả lời trong khung bên cạnh. Hỏi tiếp ngay trong khung; không cần copy prompt.
3. Nếu trình duyệt hỏi quyền mạng cục bộ, cho phép TechPath kết nối với bộ gia sư trên máy. Nếu bị chặn, dùng `http://127.0.0.1:4173`, xuất/nhập JSON để chuyển tiến độ từ bản web. Không mở cổng ra Internet.

Khung gia sư cho chọn **Antigravity** (Gemini, Claude, GPT-OSS qua 9Router) hoặc **Codex** (ChatGPT). Antigravity mặc định dùng Gemini 3.8 Flash (Low) khi 9Router sẵn sàng; Codex dùng `gpt-6.1-sol` / Light (`low`). Không tự đổi provider/model khi lỗi và không tự mua thêm hạn mức. Hết hạn mức hoặc chưa đăng nhập thì hiển thị lỗi. Mỗi máy cần chạy bộ kết nối riêng.

Gia sư nhớ trao đổi riêng theo từng bài trên máy hiện tại, kèm hồ sơ học và nguyên tắc gợi ý từng bước. Nó không có toàn bộ lịch sử chat thiết kế app. Lịch sử hiển thị đi theo bản sao lưu JSON; lịch sử phiên Codex nằm trên máy không tự chuyển theo. Chỉ gửi khi người học bấm nút. App không đọc trực tiếp SSMS.

Chạy thủ công: `node server.mjs`. Dừng bằng Ctrl+C nếu chạy trong terminal. Bộ khởi động chạy nền để không giữ cửa sổ terminal; có thể kết thúc đúng tiến trình `node server.mjs` trong Task Manager hoặc khởi động lại máy. `.techpath-local/` là dữ liệu riêng đã được bỏ qua trong Git.

## ChatGPT / Codex integration (v0.2)

App có MCP server tại `/mcp` và công cụ `open_techpath` để mở UI cạnh cuộc trò chuyện. Trong plugin UI, “Nhờ review” → “Gửi vào cuộc trò chuyện này” gửi đề bài, code đã nhập, lỗi và câu hỏi qua MCP Apps `ui/message`. Phản hồi xuất hiện trong host chat, dùng model mà người học chọn ở đó. App không tạo model session riêng, không đọc lịch sử chat bằng API và không thu API key.

Sites tạo plugin riêng khi publish với capability `mcp`. Sau khi cài/kết nối plugin, nhờ ChatGPT/Codex “Mở TechPath ở bài sql-proc”. Dùng trong đúng chat học hiện tại để giữ bối cảnh; mở trong chat mới không sao chép lịch sử của chat cũ.

Tab web độc lập không có host bridge nên không gửi trực tiếp vào chat. Nó vẫn hỗ trợ copy ngữ cảnh và sao lưu. Browser-local state của tab web và sandbox plugin có thể tách biệt: xuất JSON ở bản web rồi nhập trong plugin nếu muốn chuyển tiến độ. Host widget-state được dùng khi được hỗ trợ; tiếp tục giữ bản JSON để sao lưu. Không có đồng bộ cloud tự động.

Build Worker: `node build.mjs`. Kiểm tra: `npm run check:all` (gồm `checks.mjs`, `checks-tutor.mjs`, `checks-mcp.mjs`). Server là ESM không dependency; build nhúng các asset UI vào Worker. Đọc `docs/integration.md` để xem ranh giới xác minh.

Không gian học kỹ năng công nghệ cho người bắt đầu với Information Systems, SQL và Windows troubleshooting. Giao diện tiếng Việt, thuật ngữ tiếng Anh, dark mode. Không cần API key cho Codex; 9Router có thể cần key nếu gateway được cấu hình yêu cầu.

## Chạy trên PC hoặc laptop

Yêu cầu Node.js 20 trở lên. Trong thư mục project:

```sh
npm start
```

Mở `http://localhost:4173`. Dừng server bằng Ctrl+C trong terminal. Có thể host thư mục `dist/` trên dịch vụ static hosting. Giữ cùng URL và trình duyệt để tiếp tục dùng dữ liệu cục bộ; thay URL tạo một vùng lưu khác.

## Bắt đầu học

1. Tổng quan → chọn 30, 60, 90, 120 phút hoặc nhập 15–240 phút.
2. Tạo buổi học → mở bài. Bài gợi ý đầu là stored procedure, tiếp nối SupportLab trong chat.
3. Đọc đề, viết query/phương án trong tab **Thực hành**. Với bài SQL, bấm **Chạy SQL** hoặc **Ctrl+Enter**; app chạy trong lab riêng `TechPathLab_*`, không phải database công ty.
4. Xem kết quả/lỗi ngay dưới editor, sửa và chạy lại khi cần. Có thể dán code hoặc nhập file `.sql` đã lưu (hỗ trợ UTF-8/UTF-16).
5. Nếu bí, mở một gợi ý. Các gợi ý là nội dung soạn sẵn, không phải phản hồi AI.
6. Nhập câu hỏi vào ô **Chỗ mình muốn hỏi review** nếu muốn giải thích thêm, rồi bấm **Review & đánh giá**. AI đối chiếu code, kết quả chạy và rubric; đạt thì lưu nhận xét và mở bài tiếp theo.
7. Hỏi tiếp trong khung gia sư. Câu hỏi tiếp không tự chấm điểm hay chuyển bài; kết quả và phần giải thích nằm trong Nhật ký.
8. Kết thúc buổi và xuất sao lưu trước khi đổi máy.

## Nội dung

15 bài: SQL (JOIN, reconciliation, rules, CTE, UNION ALL, procedure, parameters, debugging), Windows/network/PowerShell, Excel/Power BI, ticket và portfolio/phỏng vấn. Có 18 thuật ngữ. Các bài ban đầu ghi nhận đã thực hành trong chat nhưng không tự nhận là đã thành thạo.

Dataset SupportLab tải từ Cài đặt hoặc bài SQL: 6 customers, 8 orders, 5 payments. Dữ liệu giả lập có chủ đích lỗi. Nếu bảng lab đã tồn tại, script dừng; không reset, drop hoặc ghi đè dữ liệu. Report ba rule gốc trả 4 lỗi (orders 1003/1006, customers 4/5). Khi thêm rule theo bài chuyển giao, số dòng có thể thay đổi.

## AI và chi phí

Gia sư dùng Codex App Server với tài khoản ChatGPT hiện có, hoặc 9Router/Antigravity (Gemini, Claude, GPT-OSS). Cả hai đều dùng hạn mức của tài khoản/provider đã kết nối; không có cơ chế mua thêm tự động. Codex không cần API key thủ công. Nếu 9Router yêu cầu key, đặt `TECHPATH_9ROUTER_API_KEY` cho bộ kết nối. Copilot Chat trong SSMS là lựa chọn riêng, không phải backend của nút review.

Hướng dẫn chính thức:

- https://learn.microsoft.com/en-us/ssms/github-copilot/get-started
- https://learn.microsoft.com/en-us/ssms/github-copilot/chat-context
- https://learn.microsoft.com/en-us/ssms/github-copilot/code-completions
- https://docs.github.com/en/copilot/get-started/plans

SSMS version khác SQL Server version. Mục AI trong SSMS ưu tiên Chat và manual inline suggestions. Agent mode có hành vi context khác; app không điều khiển hay cấu hình SSMS thay bạn.

## Lưu tiến độ và chuyển hai máy

- Tiến độ, draft, code, lỗi, lịch ôn và thời gian nằm trong localStorage của trình duyệt theo origin hiện tại.
- Cài đặt → Xuất JSON trên PC → chuyển file → Nhập JSON trên laptop.
- Nhập sẽ thay thế toàn bộ dữ liệu hiện tại, không merge. App yêu cầu tải bản hiện tại trước khi xác nhận.
- Đồng hồ đang chạy trong file nhập được chuyển về tạm dừng. Nếu đóng tab khi timer chạy, khoảng thời gian đóng tab vẫn được tính; hãy tạm dừng trước.
- Dữ liệu lưu cục bộ không mã hóa; không dán credential hoặc dữ liệu công ty. Xóa browser data có thể xóa tiến độ. Giữ bản JSON riêng.
- GitHub giữ source, không tự đồng bộ tiến độ. Không commit JSON cá nhân hoặc workstation output. `.gitignore` có mẫu loại trừ bản backup mặc định.

## Tiến bộ và giới hạn đánh giá

App có SQL lab chạy trong database riêng trên máy và AI review khi bạn bấm nút. **AI xác nhận đạt bài thực hành** dựa trên code, kết quả chạy và rubric; đây không phải chứng nhận năng lực độc lập và AI có thể sai. “Tự làm được” vẫn cần đủ checklist và không mở hint/solution ở lần thử đó. “Tự làm + chuyển giao” cần hai ngày độc lập, có ít nhất một lần làm bài chuyển giao. Đây là công cụ theo dõi, không phải chứng nhận năng lực.

Lịch ôn: lần cần trợ giúp/cần luyện lại quay lại sau 1 ngày; các lần độc lập giãn 1, 3, 7, 14 ngày. Bắt đầu lần thử mới giữ bài trước trong Nhật ký rồi làm trống vùng soạn. Trong bài chuyển giao, gợi ý và lời giải tiêu chuẩn chỉ phục vụ khái niệm bài chính, không phải đáp án yêu cầu mới.

## Source

```text
dist/index.html       App shell
dist/style.css        Responsive dark interface
dist/tutor.css        Tutor panel styles
dist/content.js       Curriculum, hints, reference solutions, fake lab SQL
dist/app.js           Sessions, drafts, review packets, grading UI, import/export
dist/tutor.js         Tutor panel, provider/model selection, NDJSON stream
dist/sql.js           SQL lab UI client
assessment.mjs        Grading schema, prompt, validation, rendered text
tutor-context.mjs     Bounded shared history + current snapshot
tutor-prompts.mjs     Shared tutor/grading instructions
tutor-http.mjs        Local tutor HTTP routes and grading lookup
local-codex.mjs       Codex App Server connector
router-ai.mjs         9Router / Antigravity connector
sql-lab.mjs           SQL Server Express lab routes and run records
server.mjs            Dependency-free local preview
checks.mjs            Persistence / backup / render regression checks
checks-tutor.mjs      Grading, context and explanation checks
checks-mcp.mjs        MCP / Worker contract checks
docs/requirements.md  Scope and decisions
docs/integration.md   Connection, grading and verification boundaries
docs/HANDOFF.md       Current state and next steps
```

Chạy `npm run check:all` cho kiểm tra hồi quy dữ liệu, grading và MCP. Kiểm tra giao diện và kết nối AI thật trong trình duyệt; các check này không chạy SQL Server và không gọi model.

## Đưa lên GitHub

Tạo repository `techpath-learning-lab` (private mặc định) và push source. Nếu tải ZIP từ app handoff, giải nén rồi mở thư mục bằng GitHub Desktop, Add local repository → Create repository nếu cần → Publish repository. Không đưa bản sao tiến độ lên repo công khai.

## Giới hạn hiện tại (v0.4)

Không đồng bộ tự động giữa thiết bị; không đọc query SSMS chưa lưu; không xác định vị trí con trỏ. AI chỉ chạy khi bạn bấm **Nhờ review** hoặc **Review & đánh giá**, và kết quả AI có thể sai. SQL lab là database riêng trên từng máy, không phải môi trường công ty; dữ liệu và procedure không đi theo bản sao lưu JSON. Nội dung kỹ thuật và kỳ vọng dựa trên dataset gốc; cập nhật dữ liệu làm thay đổi kết quả kỳ vọng.
