# SESSION CURRENT: Tiết kiệm Ngữ Cảnh & Trạng Thái Dự Án

## 1. [PROJECT METADATA]
- **Tên dự án:** Web Cof fi (Ứng dụng đặt đồ uống trực tuyến).
- **Mục tiêu cốt lõi:** Quản lý đặt cà phê tích hợp trợ lý ảo AI để tư vấn, tự động chốt đơn (add to cart), định danh khách hàng, và thu thập/phân loại Lead thông minh.
- **Tech Stack:** 
  - **Frontend:** Tiêu chuẩn UI/UX Pro Max Minimalism (Next.js, React, Tailwind CSS, TypeScript).
  - **AI Backend:** Next.js API Routes kết nối thẳng tới OpenRouter/Gemini LLM.
  - **Database/BaaS:** Google Apps Script (GAS) + Google Sheets kết hợp gửi cảnh báo Email tự động.

## 2. [ARCHITECTURE MAP]
- `src/app/api/chat/route.ts`: API Backend của Next.js, định nghĩa System Prompt ép AI phản hồi kèm các thẻ ẩn (VD: `||LEAD_DATA={...}||`, `||ADD_TO_CART={...}||`).
- `src/components/layout/ChatWindow.tsx`: Giao diện chatbot UI, làm sạch luồng phản hồi streaming (ẩn các thẻ markup AI sinh ra), gọi lệnh cập nhật Giỏ hàng hoặc Backend khi nhận diện thẻ.
- `src/services/orderService.ts`: Tầng Service trung gian lấy nội dung parse từ Chat UI và gửi `POST` lên URL của Google Apps Script (`saveLead`).
- `src/data/menuLookup.ts`: Danh mục sản phẩm chuẩn hóa cho AI. Key bằng tiếng Anh (macchiato, cappuccino, ...).
- `src/components/layout/RightSidebar.tsx`: Chứa Giỏ hàng, trạng thái Bill thanh toán.
- `gas/Code.gs`: Google Apps Script backend hoàn chỉnh (SAVE_LEAD, SUBMIT_ORDER, Hot Email Alert).
- **Cấu trúc Database (Google Sheets `Customers`):**
  - **Cột:** SĐT (Primary Key), Tên, Địa chỉ, SessionID, Lịch sử chat, Timestamp, Món quan tâm (`favorite_item`), Mức độ Hot (`intent_level`).

## 3. [CURRENT STATE MATRIX]
- **Hoạt động ổn định (Stable):**
  - [x] Kiến trúc UI/UX tinh gọn, phản hồi streaming từ AI mượt.
  - [x] Lọc thẻ ẩn AI trước khi in UI.
  - [x] Lưu trữ cấu hình LLM_MODEL_NAME trơn tru.
  - [x] System Prompt liệt kê chính xác menuId khớp menuLookup.ts (fix session 03/04).
  - [x] Cart khởi tạo rỗng, không còn mock data cũ (fix session 03/04).
  - [x] Code.gs hoàn chỉnh: SAVE_LEAD (upsert by SĐT), SUBMIT_ORDER, Email Alert khi Hot Lead (viết mới session 03/04).
- **Cần triển khai (Pending Deploy):**
  - [ ] Deploy Code.gs lên Google Apps Script (copy nội dung `gas/Code.gs` → Apps Script Editor → Deploy Web App).
  - [ ] Cập nhật `NEXT_PUBLIC_GOOGLE_SHEETS_URL` trong `.env.local` bằng URL deployment mới.
  - [ ] Đổi `CONFIG.ALERT_EMAIL` trong Code.gs thành email thật trước khi deploy.
- **Backlog (To-do):**
  - [ ] Kiểm thử Live End-to-End từ App tới Sheet và Email.
  - [ ] Xem xét bổ sung Knowledge Base (`chatbot_data.txt`) cho menu mới.

## 4. [ACTIVE BUGS & BLOCKERS]
- **[ĐÃ FIX] Lỗi hiển thị Cart (Add to Cart Bug):**
  - Root cause: System Prompt hướng dẫn AI dùng slug tiếng Việt (`den-da`, `bac-xiu`) nhưng menuLookup.ts dùng key tiếng Anh (`macchiato`, `cappuccino`) → mismatch → fallback giá sai + ảnh mặc định.
  - Fix: Cập nhật System Prompt liệt kê chính xác 12 menuId hợp lệ bằng tiếng Anh.
- **[ĐÃ FIX] Mock data cũ (ảnh Google hết hạn):**
  - Fix: Cart khởi tạo rỗng `items: []`.
- **[ĐÃ XỬ LÝ] Code.gs chưa có:**
  - Fix: Viết mới hoàn chỉnh tại `gas/Code.gs` với đầy đủ SAVE_LEAD + SUBMIT_ORDER + Email Alert.

## 5. [HARD CONSTRAINTS & RULES]
- **UI/UX Pro Max:** KHÔNG can thiệp làm xấu UI (giữ nguyên phong cách minimalist, khoảng cách đều, sạch).
- **Silent AI Operations:** Tất cả thẻ tín hiệu (`||...||`) do AI tạo ra phải CẤM không được hiển thị cho người dùng ở phần ChatWindow.
- **Smart Data Deduplication:** Phương pháp thu thập Lead vào Google Sheets PHẢI gộp cột (Merge) theo khóa chính là Số Điện Thoại (`SĐT`). Tuyệt đối không sinh thêm dòng rác.

## 6. [NEXT IMMEDIATE ACTION]
- **Nghiệm vụ tiếp theo:** Deploy `gas/Code.gs` lên Google Apps Script, cập nhật URL vào `.env.local`, sau đó chạy test End-to-End toàn luồng: Chat → Add to Cart → Checkout → Sheet → Email Alert.
