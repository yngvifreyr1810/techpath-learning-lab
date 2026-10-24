# Tận dụng Copilot trong TechPath

Đối chiếu tài liệu GitHub ngày 24/10/2026. Đề xuất dưới đây là cách phân công việc, không phải benchmark các model trên dự án.

## Vai trò nên giao

| Việc | Cách dùng Copilot |
| --- | --- |
| Đọc code, giải thích hàm, tìm nơi cần sửa | Gửi đúng file liên quan và một câu hỏi cụ thể. |
| Sửa bug nhỏ, CRUD, validation, refactor một module | Giao một thay đổi có tiêu chí hoàn thành; yêu cầu diff và một kiểm tra phù hợp. |
| Viết test | Nêu hành vi cần bảo vệ và ca biên; yêu cầu chạy test thay vì chỉ sinh test. |
| Review độc lập | Cho đọc diff và yêu cầu chỉ báo lỗi có bằng chứng; chưa sửa code trong lượt review. |
| Issues, PR, CI | Dùng Copilot CLI/IDE hoặc agent GitHub để có ngữ cảnh và công cụ GitHub của client đó. |

Đây là các khả năng GitHub công bố: [About Copilot](https://docs.github.com/en/copilot/get-started/about-github-copilot), [Copilot CLI](https://docs.github.com/en/copilot/get-started/cli-quickstart).

## Phân công tiết kiệm

1. Local AI: thao tác nhỏ, nội dung riêng tư, giải thích ngắn.
2. Copilot: agent làm việc thường ngày cho một task có phạm vi rõ; ưu tiên model nhẹ phù hợp tài khoản. Model lớn chỉ chọn khi cần.
3. Codex: kiến trúc, lỗi khó hoặc review thay đổi có rủi ro cao.
4. Antigravity: frontend và kiểm tra tương tác trong trình duyệt.

Thực thi rồi review tuần tự khi có lý do; không mặc định gọi cả bốn cho mỗi task. Giới hạn ngữ cảnh vào file/diff cần thiết. Ví dụ prompt: “Sửa validation cho form X. Đọc quy tắc dự án, chỉ sửa file liên quan, chạy một test phù hợp, báo diff và kết quả. Không commit/push.”

Các combo fallback đang có được giữ nguyên. Khi muốn dùng riêng quota Copilot trong OpenCode, chọn model trực tiếp thuộc provider Copilot nếu client đang hiển thị. Nếu dùng Copilot native, mở CLI/IDE hoặc agent tương ứng trong AionUI. Không coi việc xuất hiện trong danh mục 9Router là bằng chứng tài khoản gọi được mọi model.

## Phân biệt client và model

Qua 9Router → OpenCode, Copilot cung cấp suy luận; công cụ đọc/sửa/chạy lệnh thuộc OpenCode. Các khả năng native như tích hợp PR/issue, autocomplete, Auto model selection không tự xuất hiện trong proxy. Chat riêng TechPath chỉ là chat, không được cấp công cụ sửa dự án.

Chat riêng có 7 lựa chọn: Local AI, Gemini Flash · Antigravity, Tiết kiệm, Codex, Copilot · GPT-5.3 Codex, Copilot · Kimi K3 và Copilot · GPT-6 Luna. Không tách model chữ/ảnh: ảnh là input bổ sung của cùng model và cùng hạn mức.

GPT-5.3 Codex và Kimi K3 là hai model nhóm Powerful đang được danh mục Copilot của 9Router quảng bá; GPT-6 Luna được thêm theo yêu cầu. Đây là lựa chọn theo thông tin danh mục, không phải benchmark hay xác nhận entitlement. [Phân loại](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing), [Kimi K3](https://github.blog/changelog/2026-08-06-kimi-k3-is-now-available-in-github-copilot/).

Khả năng nhận ảnh của model/workflow qua 9Router lấy trực tiếp từ capabilities.vision của /v1/models. Hiện 9Router báo vision=true cho ba Copilot, Gemini Flash và techpath-light. Local AI kiểm tra capabilities.vision của model đang tải trong LM Studio. Codex GPT-6.1 Sol nhận ảnh bằng input type=image của app-server, giữ sandbox read-only và tắt công cụ. [Codex App Server](https://learn.chatgpt.com/docs/app-server), [GPT-6 Luna image input](https://developers.openai.com/api/docs/models/gpt-6-luna).

Bấm Làm mới AI khi vừa thay model/provider. App kiểm tra model còn trong danh mục trước khi gửi, không tự gửi lại hay đổi provider khi lỗi. Luồng ảnh router/local/Codex đã kiểm tra bằng phản hồi giả lập; chưa chạy inference thật qua tài khoản.

## Quota cần hiểu đúng

Ảnh chụp 9Router cho thấy premium_interactions còn 200, còn chat/completions có ký hiệu ∞. Đây là dữ liệu proxy, không đủ để kết luận mọi model hoặc mọi tính năng không giới hạn.

GitHub hiện mô tả hạn mức AI credits và giá theo model/token; một số gói năm cũ vẫn có cách tính premium requests trong thời gian chuyển tiếp. Cần đối chiếu trang billing/usage chính chủ của đúng tài khoản, không suy ra quyền lợi từ chỉ số 9Router. Không bật mua thêm hoặc thay đổi ngân sách trong công việc này. [Models and pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

## Chat riêng đã bổ sung

- Xóa cuộc chat hiện tại sau xác nhận; hủy sẽ giữ nguyên. Chỉ xóa bản trên trình duyệt/origin này, không xóa bản sao lưu JSON hay lịch sử phía nhà cung cấp.
- Chọn ảnh, Ctrl+V ảnh trong ô chat hoặc kéo thả vào vùng chat. Có xem trước và bỏ ảnh; chưa gửi đến AI cho đến khi bấm Gửi.
- Tối đa 2 ảnh mỗi lượt, nguồn JPEG/PNG/WebP ≤10 MB; chuẩn hóa JPEG, cạnh dài ≤1280px và ≤384 KB/ảnh. Không nhận SVG hoặc URL ảnh bên ngoài.
- Lịch sử, ảnh và bản nháp vẫn lưu trên trình duyệt, dùng chung xuất/nhập JSON riêng. Bộ nhớ đầy sẽ báo lỗi và chặn lượt mới chưa lưu được.
- Ngữ cảnh gửi: tối đa 12 tin gần đây, 2 ảnh lịch sử gần nhất và tối đa 2 ảnh hiện tại. Xem lại ảnh cũ trong lịch sử không tạo lượt AI.
- Khung chat dùng hết chiều rộng khu vực nội dung; nút Mở rộng ẩn thanh điều hướng lớn để tập trung trò chuyện. Nút Thu gọn đưa về bố cục thường.
