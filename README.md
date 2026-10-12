# GlobalKids English 5 - Tiếng Anh Lớp 5 Chuẩn SGK Global Success

Ứng dụng học Tiếng Anh lớp 5 chuẩn chương trình Global Success (Bộ GD&ĐT) với trợ lý AI sửa phát âm, flashcard 3D tương tác, gia sư AI Thầy Cú BiBo, đấu trường tốc độ, đổi thưởng và báo cáo phụ huynh.

---

## 🚀 Hướng Dẫn Triển Khai Lên Vercel

Ứng dụng được thiết kế theo kiến trúc **Vite Single Page Application (SPA)** với **Client-side Gemini AI**, người dùng tự nhập API key cá nhân được lưu an toàn trong `localStorage` của trình duyệt. Ứng dụng chạy trực tiếp 100% trên Vercel không cần duy trì backend server.

### Các bước triển khai qua GitHub:
1. Đẩy mã nguồn dự án lên kho chứa (repository) GitHub của bạn.
2. Đăng nhập [Vercel](https://vercel.com) và chọn **Add New... ➔ Project**.
3. Import repository `globalkids-E5` từ GitHub.
4. Cấu hình Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. Nhấn **Deploy**.
6. Dự án đã có sẵn file [vercel.json](vercel.json) với cấu hình SPA rewrites `/(.*) ➔ /index.html` để tránh lỗi 404 khi tải lại trang.

---

## 🔑 Hướng Dẫn Cấu Hình Gemini API Key Cho Người Dùng

1. Truy cập [Google AI Studio](https://aistudio.google.com/api-keys) và đăng nhập bằng tài khoản Google.
2. Bấm **Create API Key** để tạo mã key miễn phí.
3. Mở ứng dụng GlobalKids English 5:
   - Khi vào ứng dụng lần đầu, màn hình **Thiết lập Model & API Key** sẽ tự động hiển thị.
   - Hoặc người dùng bấm vào nút **Settings (API Key)** kèm dòng chữ đỏ *"Lấy API key để sử dụng app"* trên thanh Header.
4. Chọn Model AI mong muốn:
   - `gemini-3-flash-preview` *(Mặc định đề xuất: Phản hồi nhanh, tối ưu token)*
   - `gemini-3-pro-preview` *(Chuyên sâu: Suy luận cao cấp, phân tích phát âm sâu)*
   - `gemini-2.5-flash` *(Ổn định: Dự phòng khi tải cao)*
5. Dán mã API key và bấm **Kiểm tra kết nối** ➔ Bấm **Lưu & Kích Hoạt AI**.

### Cơ chế Tự động Fallback & Quản lý Lỗi:
- Nếu model hiện tại gặp sự cố hoặc vượt hạn mức (Error `429 RESOURCE_EXHAUSTED`), hệ thống sẽ **ngay lập tức tự động thử lại** với model tiếp theo trong danh sách mà không làm gián đoạn bài học của học sinh.
- Nếu tất cả các model đều gặp lỗi, hệ thống hiển thị mã lỗi chính xác màu đỏ kèm nút bấm mở nhanh cài đặt để người dùng đổi key khác.

---

## 💻 Chạy Ứng Dụng Cục Bộ (Local Development)

```bash
# Cài đặt thư viện
npm install

# Khởi chạy môi trường phát triển
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`
