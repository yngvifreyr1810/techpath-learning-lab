# TechPath — Handoff

Cập nhật: 2026-10-22 · nhánh `main` · commit gần nhất `a615aac`

## 1. Trạng thái hiện tại

Repo không có `AGENTS.md`, `docs/TASKS.md` hay `docs/ARCHITECTURE.md`; tài liệu định hướng hiện tại là `README.md`, `docs/requirements.md`, `docs/integration.md` và file này.

Ứng dụng đang ở luồng **v0.4**:

- SQL lab chạy thật trong `TechPathLab_<id>` trên `localhost\SQLEXPRESS`; kết quả/lỗi hiển thị ngay trong bài.
- **Review & đánh giá** dùng code, kết quả chạy và rubric để chấm. Chỉ `pass` trên bài chưa bị sửa mới tự chuyển bài.
- Khi người học nhập câu hỏi review, kết quả có thêm mục **Giải thích phần bạn hỏi** (`answers`), lưu trong nhật ký, JSON backup và Markdown export.
- Gia sư chọn **Antigravity** (Gemini, Claude, GPT-OSS qua 9Router) hoặc **Codex** (ChatGPT). Cả hai dùng chung lịch sử hiển thị theo bài.
- Bỏ qua bài lưu attempt dạng `skipped`, không tính là đạt; thư viện có bộ lọc tương ứng.
- Tab tự kiểm tra thủ công đã được bỏ; dữ liệu tự đánh giá cũ vẫn giữ trong nhật ký.

## 2. Việc Codex/Antigravity đã làm (các commit gần đây)

- `6d72d63` — tích hợp Gemini/Antigravity qua 9Router, dùng chung lịch sử học tập.
- `7ed27ab` — lọc model Antigravity đang hoạt động, bổ sung Claude và GPT-OSS.
- `450d01f` — topbar sticky, đưa nút AI Tutor lên góc phải.
- `864b28a` — giới hạn lịch sử gửi cho tutor để giảm token.
- `1a263c9` — đổi prompt review sang dạng ngắn gọn, chấm theo yêu cầu bài; thêm `checks-tutor.mjs`.
- `a615aac` — thêm `answers` (giải thích câu hỏi review) vào schema, parser, UI, backup và export; cập nhật prompt.

Kết luận: feature giải thích câu hỏi review đã hoàn tất ở mức code và kiểm tra tự động. Chưa có xác minh live với model thật trong phiên này.

## 3. Thay đổi trong phiên này

- `dist/app.js`: `cleanGrading()` trim `answers`, loại mục rỗng sau khi import/khôi phục backup; tránh render tiêu đề/đoạn giải thích trống.
- `checks.mjs`: thêm regression test cho `answers` bẩn (topic/text chỉ có khoảng trắng) và dữ liệu hợp lệ được trim.
- `package.json`: thêm `check:tutor` và `check:all`.
- `README.md`: cập nhật luồng v0.4, hai provider AI, SQL lab, mục giải thích review, source map và lệnh kiểm tra.
- `docs/integration.md`: cập nhật `answers`, hành vi ephemeral thread, snapshot gửi kèm follow-up, provider 9Router và ranh giới xác minh; đánh dấu phần v0.3.2 là lịch sử.

Không thay đổi schema backup (v1), không thay đổi dữ liệu SQL lab, không gọi model trong test.

## 4. Kiểm tra đã chạy

```sh
npm run check:all
node build.mjs
```

Kết quả:

- `checks.mjs` — PASS (15 bài, draft isolation, backup cũ/mới, render `answers` an toàn).
- `checks-tutor.mjs` — PASS (grading schema/parser, verdict thận trọng, giữ code hiện tại, giới hạn history).
- `checks-mcp.mjs` — PASS (MCP tools/resources, Worker routes, host handshake).
- `build.mjs` — PASS (10 asset, 15 bài).

Các test này **không** chạy SQL Server và **không** gọi AI.

## 5. Việc nên làm tiếp

1. **Xác minh live (cần hạn mức):** mở app, chạy một query, nhập câu hỏi review và thử lần lượt Codex + một model Antigravity. Kiểm tra `answers` hiển thị trong khung gia sư, tab Thực hành và Nhật ký.
2. **Kiểm tra backup/import thật:** export JSON sau một review có `answers`, import lại và xác nhận phần giải thích còn nguyên.
3. **Kiểm tra Markdown export:** xác nhận mục giải thích nằm dưới phần AI review.
4. **Nếu 9Router đổi model:** cập nhật `ACTIVE_ANTIGRAVITY_MODELS` trong `router-ai.mjs` và test lại selector.
5. **Không commit** `.techpath-local/`, JSON cá nhân, Markdown nhật ký hoặc `dist/server/` (đã nằm trong `.gitignore`).

## 6. Lệnh và file chính

```sh
npm start          # server local tại http://127.0.0.1:4173
npm run check:all  # checks + tutor + MCP
npm run build      # build Worker vào dist/server/index.js
```

- `assessment.mjs` — schema/prompt/parse/assessmentText.
- `tutor-context.mjs` — history có giới hạn + snapshot hiện tại.
- `tutor-prompts.mjs` — prompt dùng chung cho Codex và 9Router.
- `local-codex.mjs` — connector Codex App Server (ephemeral thread).
- `router-ai.mjs` — connector 9Router/Antigravity.
- `dist/tutor.js` — panel gia sư, chọn provider/model, stream NDJSON.
- `dist/app.js` — bài học, SQL lab UI, grading card, backup/import/export.
