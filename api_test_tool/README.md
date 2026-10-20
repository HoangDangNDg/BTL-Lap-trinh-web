# BỘ CÔNG CỤ JAVASCRIPT KIỂM THỬ API (API TEST RUNNER TOOL)

Bộ công cụ JavaScript chuyên dụng để kiểm thử toàn diện các API của Backend .NET (cũng như Java Spring Boot), hỗ trợ cả môi trường **Terminal (Node.js)** và **Giao diện trực quan (Browser Dashboard)**.

---

## 1. Cấu trúc thư mục

```text
api_test_tool/
├── api-client.js       # Module SDK gọi API (tự động đính kèm Bearer token, đo latency, parse JSON)
├── test-runner.js      # Script chạy kiểm thử tự động trên Terminal với log màu ANSI
├── index.html          # Dashboard giao diện trực quan trên trình duyệt Web
├── package.json        # Định nghĩa lệnh chạy nhanh với npm
└── README.md           # Hướng dẫn sử dụng chi tiết
```

---

## 2. Cách 1: Chạy kiểm thử tự động trên Terminal (Node.js)

Không cần cài đặt thêm bất kỳ thư viện npm bên ngoài nào (Zero Dependencies, sử dụng `fetch` mặc định của Node.js 18+):

### Bước 1: Khởi động .NET Backend
Mở Terminal 1:
```powershell
cd C:\D\btlwebtrentruong\dotnet_backend
dotnet run
```
*(Server mặc định chạy tại: `http://localhost:5120`)*

### Bước 2: Chạy Test Runner
Mở Terminal 2:
```powershell
cd C:\D\btlwebtrentruong\api_test_tool

# Kiểm thử với URL mặc định (http://localhost:5120):
node test-runner.js

# Hoặc kiểm thử với Java Spring Boot (http://localhost:10000):
npm run test:java
```

---

## 3. Cách 2: Sử dụng Dashboard trực quan trên Trình duyệt Web

1. Nhấp đúp mở file `api_test_tool/index.html` bằng trình duyệt (Google Chrome, Microsoft Edge, Firefox, Brave...).
2. Tại thanh điều hướng, nhập **Base URL** (mặc định: `http://localhost:5120`).
3. Nhấn **"Chạy Tất Cả"** để thực hiện liên hoàn toàn bộ kịch bản kiểm thử:
   - Xác thực & Kiểm tra JWT Token.
   - Phân trang & Tìm kiếm Học sinh.
   - Gán mẻ học sinh vào khóa học (Batch - Không bị N+1).
   - Điểm danh mẻ học sinh & kiểm tra trạng thái buổi học.
   - Lập phiếu thu học phí chiết khấu & Báo cáo tài chính (SQL GroupBy).
4. Quan sát chi tiết thời gian phản hồi (Latency tính bằng mili-giây) và JSON Envelope trả về.

---

## 4. Danh sách các hàm trong SDK `api-client.js`

| Nhóm chức năng | Phương thức | Mô tả API |
| :--- | :--- | :--- |
| **Auth** | `login(user, pass)` | Đăng nhập, lưu Access Token và nhận Cookie Refresh Token |
| | `refresh(token)` | Làm mới Access Token khi hết hạn |
| | `logout()` | Hủy phiên và xóa Cookie |
| **Học Sinh** | `getStudents(params)` | Lấy danh sách có phân trang và tìm kiếm theo từ khóa |
| | `getStudentById(id)` | Xem chi tiết hồ sơ 360 của học sinh |
| | `assignCourseBatch(idKh, dsIdHs)` | Gán hàng loạt học sinh vào khóa học (Tối ưu hóa $O(1)$) |
| **Điểm Danh** | `saveAttendanceBatch(req)` | Lưu điểm danh mẻ học sinh theo buổi học |
| | `getSessionAttendance(idBuoi)` | Lấy danh sách kiểm diện của một buổi học |
| **Tài Chính** | `createTuitionReceipt(req)` | Lập phiếu thu học phí có chiết khấu, tự động ghi Sổ Quỹ |
| | `getFinancialSummary(idDn)` | Báo cáo doanh thu, chi phí, tồn quỹ trực tiếp từ MySQL |
