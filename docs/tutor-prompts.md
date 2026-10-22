# Gia sư TechPath: phản hồi ngắn, dễ hiểu

Prompt thực dùng nằm trong `tutor-prompts.mjs`. Codex và các model qua 9Router cùng dùng một bản.

- Trả lời thẳng bằng tiếng Việt quen thuộc, thường 2–4 câu dưới 80 từ.
- Không chào, khen, nhắc lại đề hoặc chép lại query/procedure dài.
- Chỉ trích 1–3 dòng code nếu cần. Chỉ gợi ý khi người học yêu cầu.
- Review: một vấn đề chính, lý do và bước tiếp theo. Đúng thì xác nhận ngắn.
- Giải thích dài hơn khi người học yêu cầu. Không ép câu hỏi gợi mở hay kiểm tra kiến thức ngoài đề.

Chấm theo yêu cầu bài đang làm. Các mục tiêu ôn tập (`lesson.checks`) không còn là điều kiện buộc người học giải thích lại trước khi được công nhận bài đúng. Yêu cầu thực hành như severity, tham số, EXEC và bằng chứng chạy vẫn được đối chiếu với đề.

Khung chat chỉ hiện kết quả, nhận xét chính, bước tiếp theo và ghi chú cải thiện nếu cần. Toàn bộ tiêu chí vẫn ở mục **Tiêu chí đánh giá** của bài làm. Bài sai, thiếu dữ kiện hoặc kết quả chạy cũ vẫn được giữ lại để sửa.

Giảm đầu vào bằng cách gửi prompt hệ thống một lần mỗi yêu cầu, không ghép lại vào gói bài; giữ tối đa 6 tin nhắn gần nhất, giới hạn 6.000 ký tự lịch sử. Không cắt code hiện tại để tiết kiệm. Bản lưu lịch sử trên trình duyệt vẫn giữ nguyên. Codex dùng Light/low và độ dài phản hồi low; không giới hạn cứng output để tránh cắt JSON chấm bài.

Kiểm tra không gọi AI: `node checks-tutor.mjs`, `node checks.mjs`, `node build.mjs`, `node checks-mcp.mjs`. Các kiểm tra xác nhận hợp đồng dữ liệu và cách hiển thị; mức tiết kiệm token và việc model tuân thủ độ ngắn cần quan sát trong sử dụng thực tế.
