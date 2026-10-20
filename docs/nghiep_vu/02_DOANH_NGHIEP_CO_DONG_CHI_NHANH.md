# BẢN ĐỒ NGHIỆP VỤ & THIẾT KẾ CƠ SỞ DỮ LIỆU: DOANH NGHIỆP, CỔ ĐÔNG & CHI NHÁNH
> **Module ID**: `02_DOANH_NGHIEP_CO_DONG_CHI_NHANH`  
> **Service cốt lõi**: `IDoanhNghiepService` / `DoanhNghiepService.cs`  
> **Controllers phụ trách**: `AdminDoanhNghiepController.cs`, `ChuDoanhNghiepChiNhanhController.cs`, `ChuDoanhNghiepCoDongController.cs`, `AdminOwnerController.cs`  
> **Trạng thái**: `[Đã hoàn thành - Đồng bộ 100% Java & .NET]`

---

## 1. TỔNG QUAN PHẠM VI NGHIỆP VỤ (MODULE OVERVIEW)

Module Doanh nghiệp, Cổ đông & Chi nhánh là nền tảng quản trị tổ chức đa chi nhánh (Multi-tenancy Architecture):
1. **Quản trị Pháp nhân Doanh nghiệp (Enterprise Management)**:
   - Đại diện cho một tổ chức / thương hiệu giáo dục vận hành hệ thống.
   - Quản lý mã số thuế, ngày thành lập, thông tin pháp lý.
   - Cơ chế bảo mật khi giải thể: Khi Admin xóa hoặc giải thể một Doanh nghiệp, hệ thống tự động bọc **Database Transaction** để:
     - Đánh dấu xóa mềm Doanh nghiệp (`xoa = true`).
     - Cascade vô hiệu hóa (khóa tài khoản) toàn bộ nhân sự trực thuộc: Chủ cổ đông, Quản lý chi nhánh, Giáo viên.
     - Thu hồi (Revoke) ngay lập tức toàn bộ RefreshToken của tất cả nhân sự thuộc doanh nghiệp đó, ngăn chặn hoàn toàn việc tiếp tục đăng nhập.
2. **Quản trị Mạng lưới Chi nhánh / Cơ sở (Branch Network)**:
   - Cho phép doanh nghiệp mở rộng nhiều cơ sở đào tạo độc lập về mặt địa lý nhưng dùng chung chương trình và dữ liệu tài chính cấp cao.
   - *Lưu ý Schema DBv4*: Bảng `chi_nhanh` không sử dụng cột `xoa` (hard-delete an toàn với kiểm tra ràng buộc không còn lớp học hay nhân sự gắn liền).
3. **Cổ đông & Góp vốn sở hữu (Shareholders & Equity Funding)**:
   - Theo dõi danh sách các thành viên góp vốn (`chu_co_dong`).
   - Ghi nhận lịch sử từng đợt góp vốn (`gop_von_so_huu`) theo ngày nộp và số tiền, làm căn cứ chia cổ tức hoặc tính tỷ lệ biểu quyết.
4. **Bổ nhiệm Quản lý Chi nhánh (Branch Manager Assignment)**:
   - Gán nhân sự Quản lý điều hành cơ sở kèm mức lương cơ bản.
   - Tự động cấp tài khoản đăng nhập với vai trò `ROLE_QUAN_LY` có phạm vi truy cập dữ liệu giới hạn tại đúng chi nhánh được phân công.

---

## 2. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & ERD)

```mermaid
erDiagram
    DOANH_NGHIEP ||--o{ CHI_NHANH : "mở các chi nhánh"
    DOANH_NGHIEP ||--o{ CHU_CO_DONG : "có các cổ đông sáng lập"
    DOANH_NGHIEP ||--o{ GOP_VON_SO_HUU : "tiếp nhận vốn đầu tư"
    DOANH_NGHIEP ||--o{ QUAN_LY : "thuê nhân sự quản lý"
    
    CHU_CO_DONG ||--o{ GOP_VON_SO_HUU : "thực hiện góp vốn"
    CHI_NHANH ||--o{ QUAN_LY : "được điều hành bởi"

    DOANH_NGHIEP {
        int id_dn PK "Auto Increment"
        string ten_dn "Tên doanh nghiệp / Trung tâm (max 255)"
        string ma_so_thue "Mã số thuế (max 50)"
        date ngay_dang_ky "Ngày cấp phép hoạt động"
        bool xoa "Soft delete flag"
    }

    CHI_NHANH {
        int id_cn PK "Auto Increment"
        int id_dn FK "Doanh nghiệp chủ quản"
        string ten_cn "Tên cơ sở / Chi nhánh (max 255)"
        string dia_chi "Địa chỉ phòng ốc cơ sở"
        string sdt "Hotline liên hệ cơ sở"
    }

    CHU_CO_DONG {
        int id_cd PK "Auto Increment"
        int id_dn FK "Doanh nghiệp góp vốn"
        string ho_ten "Họ và tên cổ đông"
        string email "Email liên hệ"
        string sdt "Số điện thoại"
        bool xoa "Soft delete flag"
    }

    GOP_VON_SO_HUU {
        int id_gop_von PK "Auto Increment"
        int id_dn FK "Doanh nghiệp nhận vốn"
        int id_cd FK "Cổ đông nộp vốn"
        date ngay_gop "Ngày nộp tiền"
        decimal so_tien_gop "Số tiền vốn đã góp"
        bool xoa "Soft delete flag"
    }

    QUAN_LY {
        int id_qly PK "Auto Increment"
        int id_cn FK "Chi nhánh phụ trách"
        int id_dn FK "Doanh nghiệp chủ quản"
        string ho_ten "Họ tên Quản lý cơ sở"
        string sdt "SĐT cá nhân"
        string cccd "CCCD định danh"
        string email "Email làm việc"
        decimal muc_luong "Mức lương thỏa thuận"
        bool xoa "Soft delete flag"
    }
```

---

## 3. CÁC LUỒNG NGHIỆP VỤ & THUẬT TOÁN SERVICE CHI TIẾT

### 3.1. Luồng Giải thể Doanh nghiệp & Cascade Khóa Nhân sự Toàn chuỗi
Hàm thực thi: `XoaDoanhNghiepAsync(int idDn)`

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên Server
    participant API as AdminDoanhNghiepController
    participant Svc as DoanhNghiepService
    participant DB as MySQL DB

    Admin->>API: DELETE /api/admin/doanh-nghiep/{idDn}
    API->>Svc: XoaDoanhNghiepAsync(idDn)
    
    Note over Svc, DB: KHỞI TẠO DATABASE TRANSACTION
    Svc->>DB: BeginTransactionAsync()
    
    Svc->>DB: Đánh dấu DoanhNghiep.xoa = true
    
    Svc->>DB: Tìm tất cả Quản lý thuộc DN -> Khóa TaiKhoan liên kết (trangThai = "BiKhoa")
    Svc->>DB: Tìm tất cả Giáo viên thuộc DN -> Khóa TaiKhoan liên kết
    Svc->>DB: Tìm tất cả Chủ cổ đông thuộc DN -> Khóa TaiKhoan liên kết
    
    Svc->>DB: Thu hồi toàn bộ RefreshToken của tất cả nhân sự thuộc DN (xoa = true)
    
    Svc->>DB: CommitTransactionAsync()
    Svc-->>API: Trả về thành công
    API-->>Admin: 200 OK (Doanh nghiệp đã giải thể, toàn bộ nhân sự bị khóa truy cập ngay lập tức)
```

### 3.2. Luồng Khởi tạo Quản lý Chi nhánh & Cấp phát Tài khoản
Hàm thực thi: `TaoQuanLyChiNhanhAsync(TaoQuanLyRequest request)`

```mermaid
flowchart TD
    Start([Nhận yêu cầu: idCn, hoTen, sdt, email, cccd, mucLuong, tenDangNhap, matKhau]) --> Step1[Kiểm tra Chi nhánh idCn tồn tại trong CSDL]
    Step1 --> Step2[Lấy idDn tự động từ Chi nhánh, không để client tự truyền lung tung]
    
    Step2 --> Step3{Kiểm tra tenDangNhap đã có người sử dụng?}
    Step3 -- Đã tồn tại --> Throw409["Báo lỗi 409 Conflict: Tên đăng nhập đã tồn tại"]
    Step3 -- Hợp lệ --> Step4[Mã hóa mật khẩu bằng BCrypt]
    
    Step4 --> TranStart[(Bắt đầu Database Transaction)]
    TranStart --> InsertQL[Tạo bản ghi mới trong bảng quan_ly]
    TranStart --> InsertTK[Tạo bản ghi mới trong bảng tai_khoan với vai trò QUAN_LY]
    TranStart --> InsertTKQL[Tạo bản ghi liên kết trong bảng tai_khoan_ql]
    
    InsertQL --> Commit[(Commit Transaction CSDL)]
    InsertTK --> Commit
    InsertTKQL --> Commit
    Commit --> End([Quản lý được tạo thành công kèm tài khoản đăng nhập])
```

---

## 4. MA TRẬN API ENDPOINTS CỦA MODULE DOANH NGHIỆP & CHI NHÁNH

| Endpoint | Method | Phân quyền (Roles) | Chức năng nghiệp vụ & Logic kiểm tra |
| :--- | :---: | :--- | :--- |
| `/api/admin/doanh-nghiep` | `GET` | Admin Server | Xem danh sách tất cả các doanh nghiệp trong hệ thống. |
| `/api/admin/doanh-nghiep/{idDn}` | `GET` | Admin Server | Xem chi tiết thông tin pháp nhân doanh nghiệp. |
| `/api/admin/doanh-nghiep` | `POST` | Admin Server | Đăng ký doanh nghiệp mới, kiểm tra trùng mã số thuế. |
| `/api/admin/doanh-nghiep/{idDn}` | `DELETE` | Admin Server | Xóa/giải thể doanh nghiệp, cascade khóa tài khoản nhân sự & thu hồi token. |
| `/api/doanh-nghiep/{idDn}/chi-nhanh` | `GET` | Admin, Chủ DN, Quản lý | Lấy danh sách tất cả các chi nhánh cơ sở của doanh nghiệp. |
| `/api/chi-nhanh/{idCn}` | `GET` | Mọi vai trò xác thực | Xem chi tiết cơ sở chi nhánh. |
| `/api/doanh-nghiep/{idDn}/chi-nhanh` | `POST` | Admin, Chủ DN | Tạo mới chi nhánh cơ sở, tự động gán `idDn` từ doanh nghiệp sở hữu. |
| `/api/chi-nhanh/{idCn}` | `PUT` | Admin, Chủ DN | Cập nhật địa chỉ, tên, số điện thoại chi nhánh. |
| `/api/chi-nhanh/{idCn}` | `DELETE` | Admin, Chủ DN | Xóa chi nhánh cơ sở (kiểm tra ràng buộc không còn lớp học hoạt động). |
| `/api/doanh-nghiep/{idDn}/co-dong` | `GET` | Admin, Chủ DN | Xem danh sách cổ đông sáng lập của doanh nghiệp. |
| `/api/doanh-nghiep/{idDn}/co-dong` | `POST` | Admin, Chủ DN | Thêm cổ đông sáng lập mới, tự động cấp tài khoản đăng nhập. |
| `/api/co-dong/{idCd}` | `DELETE` | Admin, Chủ DN | Xóa cổ đông khỏi danh sách sở hữu. |
| `/api/doanh-nghiep/gop-von` | `POST` | Admin, Chủ DN | Ghi nhận đợt nộp tiền góp vốn của cổ đông vào doanh nghiệp. |
| `/api/chi-nhanh/{idCn}/quan-ly` | `GET` | Admin, Chủ DN | Xem danh sách nhân sự quản lý điều hành cơ sở. |
| `/api/doanh-nghiep/quan-ly` | `POST` | Admin, Chủ DN | Bổ nhiệm Quản lý chi nhánh, bọc Transaction tự cấp tài khoản mã hóa BCrypt. |
| `/api/quan-ly/{idQly}` | `DELETE` | Admin, Chủ DN | Xóa Quản lý cơ sở, khóa tài khoản tương ứng. |
