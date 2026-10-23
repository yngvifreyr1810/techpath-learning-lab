# Khởi động TechPath và chọn gia sư

## Bật bộ kết nối 4173

- Bấm **Start TechPath** trên Desktop, hoặc mở `Start-TechPath.cmd` trong thư mục app. Script chờ server sẵn sàng rồi mở trình duyệt.
- Tự chạy khi đăng nhập Windows: chạy lệnh bên dưới trong PowerShell tại thư mục app. Không cần quyền Administrator.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Enable-TechPathStartup.ps1
```

Script tạo shortcut `TechPath Connector.lnk` trong Startup của người dùng hiện tại. Chạy nền, không tự mở tab. Chạy lại launcher sẽ dùng server đang hoạt động, không tạo thêm bản sao. Không di chuyển thư mục app sau khi bật; nếu di chuyển, kiểm tra shortcut cũ trước khi tạo lại.

Tắt tự khởi động:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Enable-TechPathStartup.ps1 -Disable
```

Log nằm trong `.techpath-local/connector.stderr.log` và `startup-error.log`. Nếu cổng 4173 bị một chương trình khác chiếm, launcher báo lỗi thay vì tự tắt chương trình đó. Tự khởi động chỉ bật bộ kết nối TechPath; 9Router và LM Studio vẫn cần hoạt động riêng.

## Chọn AI trong khung gia sư

| Lựa chọn | Dùng khi nào |
| --- | --- |
| Local AI | Gợi ý, giải thích cơ bản, bài có dữ liệu riêng tư. Gọi trực tiếp một model đang tải trong LM Studio, không chuyển sang cloud. |
| 9Router → Học thường ngày | Workflow `techpath-light` đã cấu hình: Free → Local. Phù hợp học thường ngày; không bảo đảm nguồn free luôn sẵn sàng. |
| 9Router → Bài khó · Codex ưu tiên | Workflow `techpath-codex-first`; có thể dùng quota tài khoản cloud. |
| 9Router → Bài khó · Antigravity ưu tiên | Workflow `techpath-antigravity-first`; có thể dùng quota tài khoản cloud. |
| Codex · ChatGPT | Bộ tích hợp Codex trực tiếp; vẫn dùng hạn mức Codex. |

9Router cần chạy ở `127.0.0.1:20128`. Danh sách lấy từ `/v1/models`; bấm **Làm mới AI** sau khi thêm workflow/model. Có tên trong danh mục chưa chứng minh đăng nhập/quota của provider còn dùng được. App gửi đúng lựa chọn; việc chuyển model trong một workflow do cấu hình 9Router quyết định. Một model riêng lẻ không tự được đổi thành workflow.

Local AI: mở LM Studio, tải **một** language model rồi bật Developer → Start server ở cổng **1235 hoặc 1234**. App đọc model đang tải ở mỗi yêu cầu; không tự tải model khác, không chọn embedding model. Nếu có nhiều model đang tải, giữ lại một model để tránh chọn nhầm. Nếu bật xác thực LM Studio, đặt `TECHPATH_LOCAL_API_KEY` cho tiến trình bộ kết nối. Không nhập key vào bài làm.

Lịch sử bài học dùng chung khi đổi AI. Mỗi yêu cầu gửi ngữ cảnh bài hiện tại cùng tối đa sáu lượt gần đây, có giới hạn độ dài; không gửi toàn bộ lịch sử. Khi chọn cloud, phần ngữ cảnh này được gửi tới provider đó. Phản hồi hiển thị workflow đã chọn và tên model do provider trả về; một gateway có thể chỉ trả tên alias.

App không tự gửi lại khi lỗi. Chỉ một yêu cầu review chạy tại một thời điểm. Model local có thể chậm hoặc trả JSON chấm bài không đúng định dạng; app báo lỗi và không tự đánh dấu đạt trong trường hợp đó.

## Máy còn lại

Link Site mở được trên PC/laptop, nhưng `127.0.0.1` luôn là chính máy đang dùng. Mỗi máy cần bộ kết nối, provider/local model riêng. Tiến độ vẫn chuyển bằng xuất/nhập file sao lưu như bản hiện tại.
