# TÀI LIỆU KỸ THUẬT HƯỚNG DẪN CÀI ĐẶT, CẤU HÌNH VÀ VẬN HÀNH HỆ THỐNG

> **Học phần**: Lập trình Web  
> **Đề tài Bài tập lớn**: XÂY DỰNG HỆ THỐNG QUẢN LÝ TRUNG TÂM GIÁO DỤC (EDUCATION CENTER MANAGEMENT SYSTEM)  
> **Căn cứ đề cương BTL (Mục 3)**: *"Toàn bộ mã nguồn chương trình và tài liệu kỹ thuật hướng dẫn cài đặt, cấu hình và script để build cơ sở dữ liệu"*.

---

## 1. YÊU CẦU MÔI TRƯỜNG HỆ THỐNG (PREREQUISITES)

Để triển khai và vận hành hệ thống một cách trơn tru, máy tính của Giảng viên / Người kiểm thử cần cài đặt các công cụ sau:

| STT | Thành phần phần mềm | Phiên bản khuyến nghị | Mục đích sử dụng | Link tải chính thức |
|:---:|:---|:---:|:---|:---|
| 1 | **.NET SDK** | `.NET 8.0` hoặc `.NET 9.0` | Build và chạy Backend Web API C# | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| 2 | **Node.js & npm** | `Node.js 18.x` hoặc `20.x` LTS | Chạy môi trường Frontend React Vite | [nodejs.org](https://nodejs.org) |
| 3 | **MySQL Server** | `MySQL 8.0+` hoặc `MariaDB 10.4+` | Hệ quản trị cơ sở dữ liệu quan hệ | [mysql.com](https://dev.mysql.com/downloads/) hoặc [XAMPP](https://www.apachefriends.org) |
| 4 | **MySQL Client** | MySQL Workbench, DBeaver, phpMyAdmin | Thực thi script SQL tạo bảng và seed data | Tùy chọn |

---

## 2. HƯỚNG DẪN BUILD CƠ SỞ DỮ LIỆU (DATABASE SETUP)

File script build CSDL đã được đóng gói sẵn tại thư mục gốc của dự án:  
📂 **[`build_database_trung_tam_giao_duc.sql`](file:///build_database_trung_tam_giao_duc.sql)**

### Các bước thực hiện:
1. Mở phần mềm quản trị CSDL (ví dụ **MySQL Workbench**, **DBeaver**, **HeidiSQL** hoặc **phpMyAdmin** trên XAMPP).
2. Kết nối tới MySQL Server cục bộ (mặc định Port: `3306`, User: `root`, Mật khẩu: để trống hoặc theo mật khẩu máy bạn).
3. Mở file `build_database_trung_tam_giao_duc.sql` và nhấn **Execute (Chạy toàn bộ script)** (phím tắt `Ctrl + Shift + Enter` trên Workbench).
4. **Kết quả**:
   - Hệ thống tự động tạo CSDL `trung_tam_giao_duc_dbv4` với bảng mã chuẩn `utf8mb4_unicode_ci`.
   - Tự động khởi tạo hơn 30 bảng thực thể ràng buộc khóa chính, khóa ngoại.
   - Tự động nạp dữ liệu mẫu (Seed Data): Doanh nghiệp, Chi nhánh, Phòng học, Khóa học, Lớp học, Giáo viên, Tài khoản, Học sinh và Phiếu thu.

---

## 3. CẤU HÌNH VÀ KHỞI CHẠY BACKEND (.NET 8 WEB API)

### 3.1. Cấu hình chuỗi kết nối Database & JWT
Mở file: `dotnet_backend/appsettings.json` và kiểm tra các thông số kết nối:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=127.0.0.1;Port=3306;Database=trung_tam_giao_duc_dbv4;Uid=root;Pwd=;Charset=utf8mb4;"
  },
  "Jwt": {
    "Issuer": "quanlytrungtam-auth-service",
    "Audience": "quanlytrungtam-client",
    "SecretKey": "dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9uLXdpdGgtc3VmZmljaWVudC1sZW5ndGgtMjU2LWJpdHM=",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  }
}
```
*(Nếu MySQL của bạn có mật khẩu root, hãy điền vào `Pwd=mat_khau_cua_ban;`)*.

### 3.2. Lệnh khởi chạy Backend
Mở Command Prompt / PowerShell tại thư mục `dotnet_backend` và chạy:

```bash
cd dotnet_backend
dotnet restore
dotnet run --launch-profile http
```
- **Backend URL**: `http://localhost:5120`
- **Tài liệu API tương tác trực quan (Scalar OpenAPI Reference)**: `http://localhost:5120/scalar/v1`

---

## 4. CẤU HÌNH VÀ KHỞI CHẠY FRONTEND (REACT + VITE)

### Các bước thực hiện:
1. Mở terminal tại thư mục `frontend`:
```bash
cd frontend
npm install
npm run dev
```
2. **Frontend URL**: `http://localhost:5173`
- Giao diện người dùng sẽ tự động kết nối và giao tiếp với Backend .NET qua cổng `5120`.

---

## 5. KHỞI ĐỘNG NHANH 1-CLICK BẰNG FILE TẬP LỆNH (.BAT)

Để tiện lợi tối đa cho Giảng viên khi chấm bài, nhóm đã tạo sẵn tập lệnh tự động:  
📂 **[`start-project.bat`](file:///start-project.bat)**

- **Cách sử dụng**: Chỉ cần nhấp đúp chuột vào file `start-project.bat`.
- Tập lệnh sẽ tự động mở 2 cửa sổ terminal độc lập:
  - Cửa sổ 1: Khởi động Backend .NET tại `http://localhost:5120`
  - Cửa sổ 2: Khởi động Frontend React Vite tại `http://localhost:5173`

---

## 6. DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP KIỂM THỬ (TEST CREDENTIALS)

Toàn bộ tài khoản đã được nạp sẵn vào CSDL qua script build:

| Vai trò người dùng | Tên đăng nhập (Username) | Mật khẩu (Password) | Quyền hạn trong hệ thống |
|:---|:---:|:---:|:---|
| **Chủ doanh nghiệp / Quản trị viên** | `admin_an` | `123456` | Toàn quyền quản trị trung tâm, xem báo cáo doanh thu, sổ quỹ cổ đông |
| **Quản lý cơ sở chi nhánh** | `quanly_caugiay` | `123456` | Tiếp nhận học sinh, gán lớp học, lập phiếu thu học phí, điểm danh |
| **Giảng viên chuyên môn** | `gv_hoangyen` | `123456` | Xem thời khóa biểu cá nhân, điểm danh học sinh lớp phụ trách |

---

## 7. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

1. **Lỗi không kết nối được MySQL (`Access denied` hoặc `Unable to connect`)**:
   - Kiểm tra MySQL Service đã được Start trong Windows Services / XAMPP Control Panel chưa.
   - Kiểm tra tài khoản `root` và mật khẩu trong `dotnet_backend/appsettings.json`.
2. **Lỗi cổng `5120` hoặc `5173` bị ứng dụng khác chiếm giữ**:
   - Tắt các tiến trình đang chiếm cổng hoặc đổi cổng trong `dotnet_backend/Properties/launchSettings.json` và `frontend/vite.config.ts`.
3. **Lỗi Frontend báo "Network Error" khi gọi API**:
   - Đảm bảo Backend .NET đang chạy ở `http://localhost:5120`.
   - Kiểm tra cấu hình CORS trong `dotnet_backend/Program.cs` đã cho phép `http://localhost:5173`.
