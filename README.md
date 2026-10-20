# HỆ THỐNG QUẢN LÝ TRUNG TÂM GIÁO DỤC (EDUCATION CENTER MANAGEMENT SYSTEM)

> **Tài liệu đặc tả kiến trúc, luồng ánh xạ Java sang .NET và hướng dẫn phát triển**  
> **Học phần**: Lập trình Web - Đề tài Bài tập lớn (BTL)  
> **Backend**: **.NET (C#) Web API** map 1-1 từ **Java Spring Boot backend có sẵn**  
> **Database**: MySQL `trung_tam_giao_duc_dbv4` (dùng chung CSDL với backend Java)  
> **Bảo mật**: **JWT Authentication (JSON Web Token)** với đồng bộ Secret Key, Claims và Issuer  
> **Frontend**: **HTML5 / CSS3 / JavaScript (Bootstrap 5, jQuery AJAX)**

---

## 1. TỔNG QUAN HỆ THỐNG VÀ BỐI CẢNH NÂNG CẤP

Hệ thống **Quản lý Trung tâm Giáo dục** là giải pháp phần mềm quản trị toàn diện cho các trung tâm đào tạo, trung tâm ngoại ngữ, bồi dưỡng văn hóa và kỹ năng:
- **Quản lý đa chi nhánh & phòng học**: Quản lý cơ sở vật chất, phòng học, sức chứa.
- **Quản lý hồ sơ Giáo viên & Nhân sự**: Chuyên môn, bằng cấp, chi nhánh giảng dạy, chấm công/điểm danh và tính lương.
- **Quản lý Học sinh 360° & Phụ huynh**: Tiếp nhận học sinh, hồ sơ phụ huynh, gắn lớp/khóa học, bảo lưu và chuyển lớp.
- **Quản lý Đào tạo, Khóa học & Lớp học**: Môn học, bộ môn, khóa học theo kỳ/năm học, thời khóa biểu tuần và buổi học chi tiết.
- **Nghiệp vụ Điểm danh**: Điểm danh học sinh từng buổi, điểm danh giáo viên, báo cáo chuyên cần.
- **Quản lý Tài chính & Thu chi**: Phiếu thu học phí, thanh toán lương giáo viên, sổ quỹ thu chi theo tuần/tháng/kỳ/năm học.
- **Phân quyền người dùng & Bảo mật JWT**: Chủ doanh nghiệp, Quản trị viên (Admin), Quản lý chi nhánh (Quản lý), Giáo viên.

---

## 2. BẢN ĐỒ TỔNG QUAN HỆ THỐNG TÀI LIỆU (DOCS STRUCTURE)

| STT | Tên File Tài Liệu | Vai Trò & Chức Năng Chính | Trạng Thái |
|:---:|:---|:---|:---:|
| 1 | [`README.md`](file:///c:/D/btlwebtrentruong/README.md) | Tổng quan hệ thống trung tâm giáo dục, bản đồ điều hướng và lộ trình. | `[Đã hoàn thành]` |
| 2 | [`01_KIEN_TRUC_VA_LUONG_DU_LIEU.md`](file:///c:/D/btlwebtrentruong/01_KIEN_TRUC_VA_LUONG_DU_LIEU.md) | Kiến trúc Backend .NET ánh xạ 1-1 từ Java Spring Boot, ma trận chuyển đổi Annotation và luồng JWT 2 chiều. | `[Đã hoàn thành]` |
| 3 | [`02_DAC_TA_CAC_MODULE_NGHIEP_VU.md`](file:///c:/D/btlwebtrentruong/02_DAC_TA_CAC_MODULE_NGHIEP_VU.md) | Đặc tả 8 phân hệ nghiệp vụ quản lý trung tâm giáo dục theo schema DB MySQL `trung_tam_giao_duc_dbv4`. | `[Đã hoàn thành]` |
| 4 | [`03_QUY_CHUAN_API_VA_LUONG_AJAX.md`](file:///c:/D/btlwebtrentruong/03_QUY_CHUAN_API_VA_LUONG_AJAX.md) | Đặc tả RESTful API, đồng bộ JWT Bearer Token, HttpOnly Cookie Refresh Token và jQuery AJAX client. | `[Đã hoàn thành]` |
| 5 | [`04_HUONG_DAN_FRONTEND_HTML_BOOTSTRAP.md`](file:///c:/D/btlwebtrentruong/04_HUONG_DAN_FRONTEND_HTML_BOOTSTRAP.md) | Thiết kế giao diện HTML5/Bootstrap 5 cho quản lý trung tâm (Dashboard, Học viên, Lớp học, Điểm danh, Thu phí). | `[Đã hoàn thành]` |
| 6 | [`05_DANH_MUC_TEST_CASE.md`](file:///c:/D/btlwebtrentruong/05_DANH_MUC_TEST_CASE.md) | Danh mục kịch bản kiểm thử (Test Cases) bám sát các nghiệp vụ trung tâm giáo dục theo mục 4.4 đề cương BTL. | `[Đã hoàn thành]` |

---

## 3. CƠ CẤU THƯ MỤC DỰ ÁN TRÊN HỆ THỐNG

```text
c:\D\btlwebtrentruong\
│
├── BaiTapLon.doc                           # Đề cương hướng dẫn BTL của trường
├── README.md                               # Hướng dẫn & tổng quan dự án
├── 01_KIEN_TRUC_VA_LUONG_DU_LIEU.md        # Kiến trúc .NET map 1-1 từ Java Spring Boot
├── 02_DAC_TA_CAC_MODULE_NGHIEP_VU.md       # Đặc tả các module quản lý trung tâm
├── 03_QUY_CHUAN_API_VA_LUONG_AJAX.md       # Chuẩn RESTful API & JWT Bearer Token
├── 04_HUONG_DAN_FRONTEND_HTML_BOOTSTRAP.md # Thiết kế HTML, Bootstrap 5, UI/UX trung tâm
├── 05_DANH_MUC_TEST_CASE.md                # Danh mục Test cases theo chuẩn BTL
│
├── backend/                                # [NGUỒN GỐC] Backend Java Spring Boot có sẵn
│   ├── src/main/java/com/example/project/  # Codebase Java (Entities, Repositories, Services, Controllers, JWT)
│   ├── src/main/resources/                 # application.properties, database.sql (MySQL)
│   └── pom.xml
│
└── dotnet_backend/                         # [DỰ ÁN .NET MỚI TẠO] Map trực tiếp từ backend Java
    ├── Common/                             # ApiResponse.cs, PagedResult.cs
    ├── Controllers/                        # Api Controllers (Auth, HocSinh, LopHoc, DiemDanh, ThuChi)
    ├── DTOs/                               # Data Transfer Objects
    ├── Entities/                           # POCO Entities ánh xạ bảng MySQL trung_tam_giao_duc_dbv4
    ├── Security/                           # IJwtProvider, JwtProvider (đồng bộ JWT với Java)
    ├── Services/                           # Business Services
    ├── Data/                               # QuanLyTrungTamDbContext (Pomelo.EntityFrameworkCore.MySql)
    ├── appsettings.json                    # Connection String MySQL & Secret Key JWT
    ├── Program.cs                          # Đăng ký JWT Bearer, CORS, Scalar OpenAPI Reference
    └── dotnet_backend.csproj               # .NET Web API Project File
```

---

## 4. BẢNG THÔNG SỐ CẤU HÌNH ĐỒNG BỘ GIỮA JAVA VÀ .NET

| Tham số | Giá trị đồng bộ trong Java (`application.properties`) | Giá trị đồng bộ trong .NET (`appsettings.json`) |
|:---|:---|:---|
| **Database Server** | MySQL `127.0.0.1:3306` | MySQL `Server=127.0.0.1;Port=3306` |
| **Tên Cơ sở dữ liệu** | `trung_tam_giao_duc_dbv4` | `Database=trung_tam_giao_duc_dbv4` |
| **Username / Password** | `root` / `""` | `Uid=root;Pwd=;` |
| **Mã hóa kết nối** | `useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8` | `Charset=utf8mb4;` |
| **JWT Secret Key** | `dGhpcy1pcy1hLXNlY3JldC1rZXktZm9yLWp3dC10b2tlbi1nZW5lcmF0aW9uLXdpdGgtc3VmZmljaWVudC1sZW5ndGgtMjU2LWJpdHM=` | Đồng bộ 100% Base64 decoded key |
| **JWT Issuer** | `quanlytrungtam-auth-service` | `quanlytrungtam-auth-service` |
| **JWT Claims** | `userId`, `roles`, `roleId`, `idDoanhNghiep`, `idChiNhanh`, `quyenHan` | Đồng bộ 100% trong `JwtPayloadDto.cs` |
| **Thời hạn Access Token**| 900.000 ms (15 phút) | 15 phút |
| **Thời hạn Refresh Token**| 604.800.000 ms (7 ngày) | 7 ngày |
