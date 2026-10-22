# TechPath — Personal Learning Lab

## Gia sư trực tiếp (v0.3)

1. Trên Windows, mở `Start-TechPath.cmd` trong thư mục project. Cần Node.js 20+ và Codex đã đăng nhập bằng ChatGPT. Bộ khởi động tìm Codex CLI hoặc bản đi kèm desktop app.
2. Mở bài, nhập code/kết quả/suy luận/câu hỏi rồi bấm **Nhờ review**. App đọc các ô đó và trả lời trong khung bên cạnh. Hỏi tiếp ngay trong khung; không cần copy prompt.
3. Nếu trình duyệt hỏi quyền mạng cục bộ, cho phép TechPath kết nối với bộ gia sư trên máy. Nếu bị chặn, dùng `http://127.0.0.1:4173`, xuất/nhập JSON để chuyển tiến độ từ bản web. Không mở cổng ra Internet.

Dùng `gpt-6.1-sol` / Light (`low`) với hạn mức Codex của tài khoản ChatGPT đã đăng nhập. Không yêu cầu API key và không tự đổi sang model khác. Hết hạn mức hoặc chưa đăng nhập thì hiển thị lỗi, không tự mua thêm. Mỗi máy cần chạy bộ kết nối riêng.

Gia sư nhớ trao đổi riêng theo từng bài trên máy hiện tại, kèm hồ sơ học và nguyên tắc gợi ý từng bước. Nó không có toàn bộ lịch sử chat thiết kế app. Lịch sử hiển thị đi theo bản sao lưu JSON; lịch sử Codex nằm trên máy không tự chuyển theo. Chỉ gửi khi người học bấm nút. App không đọc trực tiếp SSMS.

Chạy thủ công: `node server.mjs`. Dừng bằng Ctrl+C nếu chạy trong terminal. Bộ khởi động chạy nền để không giữ cửa sổ terminal; có thể kết thúc đúng tiến trình `node server.mjs` trong Task Manager hoặc khởi động lại máy. `.techpath-local/` là dữ liệu riêng đã được bỏ qua trong Git.

## ChatGPT / Codex integration (v0.2)

App có MCP server tại `/mcp` và công cụ `open_techpath` để mở UI cạnh cuộc trò chuyện. Trong plugin UI, “Nhờ review” → “Gửi vào cuộc trò chuyện này” gửi đề bài, code đã nhập, lỗi và câu hỏi qua MCP Apps `ui/message`. Phản hồi xuất hiện trong host chat, dùng model mà người học chọn ở đó. App không tạo model session riêng, không đọc lịch sử chat bằng API và không thu API key.

Sites tạo plugin riêng khi publish với capability `mcp`. Sau khi cài/kết nối plugin, nhờ ChatGPT/Codex “Mở TechPath ở bài sql-proc”. Dùng trong đúng chat học hiện tại để giữ bối cảnh; mở trong chat mới không sao chép lịch sử của chat cũ.

Tab web độc lập không có host bridge nên không gửi trực tiếp vào chat. Nó vẫn hỗ trợ copy ngữ cảnh và sao lưu. Browser-local state của tab web và sandbox plugin có thể tách biệt: xuất JSON ở bản web rồi nhập trong plugin nếu muốn chuyển tiến độ. Host widget-state được dùng khi được hỗ trợ; tiếp tục giữ bản JSON để sao lưu. Không có đồng bộ cloud tự động.

Build Worker: `node build.mjs`. Kiểm tra: `node checks.mjs` và `node checks-mcp.mjs`. Server là ESM không dependency; build nhúng các asset UI vào Worker. Đọc `docs/integration.md` để xem ranh giới xác minh.

Không gian học kỹ năng công nghệ cho người bắt đầu với Information Systems, SQL và Windows troubleshooting. Giao diện tiếng Việt, thuật ngữ tiếng Anh, dark mode. Không yêu cầu API key hoặc cài thư viện cho app.

## Chạy trên PC hoặc laptop

Yêu cầu Node.js 20 trở lên. Trong thư mục project:

```sh
npm start
```

Mở `http://localhost:4173`. Dừng server bằng Ctrl+C trong terminal. Có thể host thư mục `dist/` trên dịch vụ static hosting. Giữ cùng URL và trình duyệt để tiếp tục dùng dữ liệu cục bộ; thay URL tạo một vùng lưu khác.

## Bắt đầu học

1. Tổng quan → chọn 30, 60, 90, 120 phút hoặc nhập 15–240 phút.
2. Tạo buổi học → mở bài. Bài gợi ý đầu là stored procedure, tiếp nối SupportLab trong chat.
3. Đọc đề, làm trong SSMS. App không kết nối SQL Server hoặc chạy SQL.
4. Dán code/kết quả, hoặc nhập file `.sql` đã lưu (hỗ trợ UTF-8/UTF-16).
5. Nếu bí, mở một gợi ý. Các gợi ý là nội dung soạn sẵn, không phải phản hồi AI.
6. “Nhờ review” đọc bài làm và mở phản hồi Codex trong khung gia sư. Bộ kết nối phải chạy trên máy.
7. Tự kiểm tra theo checklist, ghi nhận mức độc lập. Lần thử cũ nằm trong Nhật ký.
8. Kết thúc buổi và xuất sao lưu trước khi đổi máy.

## Nội dung

15 bài: SQL (JOIN, reconciliation, rules, CTE, UNION ALL, procedure, parameters, debugging), Windows/network/PowerShell, Excel/Power BI, ticket và portfolio/phỏng vấn. Có 18 thuật ngữ. Các bài ban đầu ghi nhận đã thực hành trong chat nhưng không tự nhận là đã thành thạo.

Dataset SupportLab tải từ Cài đặt hoặc bài SQL: 6 customers, 8 orders, 5 payments. Dữ liệu giả lập có chủ đích lỗi. Nếu bảng lab đã tồn tại, script dừng; không reset, drop hoặc ghi đè dữ liệu. Report ba rule gốc trả 4 lỗi (orders 1003/1006, customers 4/5). Khi thêm rule theo bài chuyển giao, số dòng có thể thay đổi.

## AI và chi phí

Gia sư dùng Codex App Server với tài khoản ChatGPT hiện có, chịu hạn mức của gói. Không dùng API key hoặc cơ chế mua thêm tự động. Copilot Chat trong SSMS là lựa chọn riêng, không phải backend của nút review mới.

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

## Tiến bộ là tự đánh giá

Không có SQL execution, chấm AI hoặc kiểm chứng output tự động. “Tự làm được” cần đủ checklist và không mở hint/solution ở lần thử đó. “Tự làm + chuyển giao” cần hai ngày độc lập, có ít nhất một lần làm bài chuyển giao. Đây là công cụ theo dõi, không phải chứng nhận năng lực.

Lịch ôn: lần cần trợ giúp/cần luyện lại quay lại sau 1 ngày; các lần độc lập giãn 1, 3, 7, 14 ngày. Bắt đầu lần thử mới giữ bài trước trong Nhật ký rồi làm trống vùng soạn. Trong bài chuyển giao, gợi ý và lời giải tiêu chuẩn chỉ phục vụ khái niệm bài chính, không phải đáp án yêu cầu mới.

## Source

```text
dist/index.html       App shell
dist/style.css        Responsive dark interface
dist/content.js       Curriculum, hints, reference solutions, fake lab SQL
dist/app.js           Sessions, draft persistence, review packets, import/export
server.mjs            Dependency-free local preview
checks.mjs            Persistence / backup / planner regression checks
docs/requirements.md  Scope and decisions
```

Chạy `npm run check` cho kiểm tra hồi quy dữ liệu và logic kế hoạch. Kiểm tra giao diện riêng trong trình duyệt; các check này không chạy SQL Server.

## Đưa lên GitHub

Tạo repository `techpath-learning-lab` (private mặc định) và push source. Nếu tải ZIP từ app handoff, giải nén rồi mở thư mục bằng GitHub Desktop, Add local repository → Create repository nếu cần → Publish repository. Không đưa bản sao tiến độ lên repo công khai.

## Giới hạn v0.1

Không đồng bộ tự động giữa thiết bị; không đọc query SSMS chưa lưu; không xác định vị trí con trỏ; không dùng LLM trong app; không chạy SQL hoặc PowerShell. Thực hành và đối chiếu thực tế được làm trong SSMS/Windows. Nội dung kỹ thuật và kỳ vọng dựa trên dataset gốc; cập nhật dữ liệu làm thay đổi kết quả kỳ vọng.
