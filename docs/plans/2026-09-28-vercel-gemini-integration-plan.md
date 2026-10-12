# Kế hoạch Triển khai: Chuẩn hóa Vercel Deployment & Quản lý Gemini API Key Client-Side

- **Ngày tạo**: 2026-09-28
- **Dự án**: GlobalKids English 5 (Chuẩn SGK Global Success 5)
- **Mục tiêu**: Chuẩn hóa triển khai Vercel SPA, cấu hình Gemini API Key phía client (localStorage), hỗ trợ chọn Model và cơ chế tự động Fallback/Retry theo đúng `AI_INSTRUCTIONS.md`.

---

## 1. Bối cảnh & Yêu cầu Kỹ thuật
Theo tài liệu [AI_INSTRUCTIONS.md](file:///c:/Users/PC/Desktop/APP/globalkids-E5/AI_INSTRUCTIONS.md):
1. **Triển khai Vercel**: Bổ sung `vercel.json` định tuyến SPA rewrites về `/index.html`.
2. **Cấu hình Model AI**:
   - Model mặc định đề xuất: `gemini-3-flash-preview` / `gemini-3-pro-preview`.
   - Danh sách model dự phòng:
     1. `gemini-3-flash-preview`
     2. `gemini-3-pro-preview`
     3. `gemini-2.5-flash`
   - Cơ chế Retry: Tự động chuyển model kế tiếp khi gặp lỗi API, giữ nguyên trạng thái input của người dùng.
3. **Quản lý API Key**:
   - Người dùng nhập key cá nhân qua Modal hoặc nút Settings trên Header.
   - Lưu vào `localStorage` của trình duyệt.
   - Nút Settings trên Header hiển thị dòng chữ màu đỏ *"Lấy API key để sử dụng app"*.
   - Hướng dẫn người dùng lấy key tại: `https://aistudio.google.com/api-keys`.
4. **Quản lý Lỗi**:
   - Hiển thị nguyên văn mã lỗi từ API (ví dụ: `429 RESOURCE_EXHAUSTED`).
   - Trạng thái các bước bị lỗi chuyển thành *"Đã dừng do lỗi"*, không hiển thị thành công giả lập.

---

## 2. Kiến trúc & Các thành phần triển khai

### A. Vercel SPA Routing
- File: `vercel.json` ở root.

### B. Client-side AI Service (`src/services/geminiClient.ts`)
- Sử dụng trực tiếp thư viện `@google/genai` trên trình duyệt.
- Tự động lấy key và model từ `localStorage`.
- Xử lý Retry/Fallback tuần tự qua danh sách 3 model:
  `[selectedModel, ...fallbackModels]`.
- Bắt lỗi chi tiết và trích xuất error code (`429`, `400`, `RESOURCE_EXHAUSTED`,...).

### C. Giao diện Quản lý API Key (`src/components/ApiKeyModal.tsx`)
- Card chọn 3 model: `gemini-3-flash-preview`, `gemini-3-pro-preview`, `gemini-2.5-flash`.
- Ô nhập API Key với nút ẩn/hiện, nút Test kết nối.
- Link trực tiếp tới Google AI Studio.
- Hỗ trợ lưu trữ và nút "Để sau / Dùng thử ngoại tuyến".

### D. Tích hợp Header (`src/components/Navbar.tsx`)
- Thêm nút Settings API Key kèm badge màu đỏ nổi bật *"Lấy API key để sử dụng app"* khi chưa có key.
- Hiển thị model hiện tại khi đã cấu hình key.

### E. Tích hợp AI Components
- `src/components/AIPronunciationModal.tsx`: Chuyển sang gọi client service, hiển thị trạng thái model, fallback thông báo và hiển thị lỗi chuẩn.
- `src/components/AITutorChatModal.tsx`: Chuyển sang gọi client service, tương tác thông minh với Thầy Cú BiBo.
- `src/App.tsx`: Điều phối hiển thị Modal cài đặt.
