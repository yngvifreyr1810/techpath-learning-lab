# Gia sư TechPath: đủ ý theo ngữ cảnh, dễ hiểu

Prompt thực dùng nằm trong `tutor-prompts.mjs`. Codex và các model qua 9Router cùng dùng một bản.

- Trả lời thẳng bằng tiếng Việt quen thuộc. Câu hỏi đơn giản thường 2–4 câu; nhiều ý được chia thành các mục, không áp trần 80 từ cho cả phản hồi.
- Không chào, khen, nhắc lại đề hoặc chép lại query/procedure dài.
- Đọc cả code, kết quả, **ghi chú về mức độ đã học** và **câu hỏi review**. Khi người học chưa học chủ đề đó, giới thiệu nền cần thiết rồi giải thích tác dụng và vị trí của từng lệnh trong code.
- Review có hai phần: đánh giá ngắn và giải đáp đủ các ý đã hỏi trong cùng một lần. Không dùng gợi ý sửa bài thay cho giải thích. Mỗi khái niệm thường 2 câu ngắn khoảng 30–50 từ; thêm câu khi cần đủ ý, bỏ các chi tiết phụ chưa được hỏi.
- Chỉ trích đoạn code cần bàn. Chỉ gợi ý từng chút khi người học yêu cầu. Không ép câu hỏi gợi mở hay kiểm tra kiến thức ngoài đề.

Chấm theo yêu cầu bài đang làm. Các mục tiêu ôn tập (`lesson.checks`) không còn là điều kiện buộc người học giải thích lại trước khi được công nhận bài đúng. Yêu cầu thực hành như severity, tham số, EXEC và bằng chứng chạy vẫn được đối chiếu với đề.

Kết quả AI có trường `answers` gồm các mục `topic` và `text`. Câu hỏi review không trống thì phần này phải có nội dung; app không nhận một kết quả bỏ trống hoàn toàn phần giải đáp. Các mục hiển thị trong chat và phần **Giải thích phần bạn hỏi** của bài làm; được giữ trong bản sao lưu JSON và nhật ký Markdown. Các bản sao lưu cũ không có `answers` vẫn nhập được. Toàn bộ tiêu chí vẫn ở mục **Tiêu chí đánh giá**. Bài sai, thiếu dữ kiện hoặc kết quả chạy cũ vẫn được giữ lại để sửa; phần giải thích vẫn được hiển thị.

Giảm đầu vào bằng cách gửi prompt hệ thống một lần mỗi yêu cầu, không ghép lại vào gói bài; giữ tối đa 6 tin nhắn gần nhất, giới hạn 6.000 ký tự lịch sử. Không cắt code hiện tại để tiết kiệm. Câu hỏi tiếp theo được đánh dấu riêng để tránh giải thích lại câu hỏi cũ. Codex dùng Light/low; cho phép mức trình bày medium khi có ghi chú/câu hỏi cần giải thích. Không giới hạn cứng output để tránh cắt JSON hoặc mất ý.

Kiểm tra không gọi AI: `node checks-tutor.mjs`, `node checks.mjs`, `node build.mjs`, `node checks-mcp.mjs`. Các kiểm tra xác nhận hợp đồng dữ liệu và cách hiển thị; mức tiết kiệm token và việc model tuân thủ độ ngắn cần quan sát trong sử dụng thực tế.
