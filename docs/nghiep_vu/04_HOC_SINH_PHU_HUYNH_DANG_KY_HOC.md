# BẢN ĐỒ NGHIỆP VỤ & THIẾT KẾ CƠ SỞ DỮ LIỆU: HỌC SINH, PHỤ HUYNH & ĐĂNG KÝ HỌC
> **Module ID**: `04_HOC_SINH_PHU_HUYNH_DANG_KY_HOC`  
> **Service cốt lõi**: `IHocSinhService` / `HocSinhService.cs`  
> **Controllers phụ trách**: `ChuDoanhNghiepStudentController.cs`, `HocSinhKhoaHocController.cs`, `QuanLyHoSoHocSinh360Controller.cs`  
> **Trạng thái**: `[Đã hoàn thành - Đồng bộ 100% Java & .NET]`

---

## 1. TỔNG QUAN PHẠM VI NGHIỆP VỤ (MODULE OVERVIEW)

Module Học sinh & Phụ huynh đảm nhiệm việc quản lý vòng đời học viên từ khi tiếp cận đến khi theo học:
1. **Hồ sơ học sinh 360**: Quản lý thông tin định danh cá nhân (Họ tên, Ngày sinh, Giới tính, SĐT, CCCD, Địa chỉ). Kiểm tra chống trùng số CCCD nghiêm ngặt trong phạm vi doanh nghiệp.
2. **Quan hệ đa chiều Phụ huynh - Học sinh (M:N)**:
   - Mô hình linh hoạt: 1 phụ huynh có thể có nhiều con đang theo học tại trung tâm; 1 học sinh có thể có nhiều người giám hộ (Bố, Mẹ, Người giám hộ hợp pháp).
   - Thiết lập cờ `la_nguoi_dai_dien` (người nhận thông báo chính và chịu trách nhiệm nộp học phí).
   - Tính năng tự động tái sử dụng hồ sơ phụ huynh: Khi thêm phụ huynh cho học sinh, nếu số CCCD đã tồn tại trong CSDL thì tự động tạo liên kết mới trong bảng trung gian `phu_huynh_hoc_sinh`, tránh nhân bản dữ liệu rác.
3. **Gán học sinh vào Khóa học & Cascade Đăng ký học**:
   - Khi gán học sinh vào khóa học thuộc một lớp học cụ thể, hệ thống tự động kiểm tra và khởi tạo (hoặc khôi phục) bản ghi `dang_ky_hoc`.
   - Hỗ trợ gán đơn lẻ hoặc gán hàng loạt (`batch assign`).
   - Cascade soft-delete: Khi xóa học sinh khỏi khóa học/lớp học, bản ghi tương ứng trong `dang_ky_hoc` sẽ tự động được đánh dấu xóa mềm (`xoa = true`).
4. **Đồng bộ dữ liệu phi chuẩn hóa (Denormalization Sync)**: Khi cập nhật họ tên học sinh tại bảng gốc `hoc_sinh`, hệ thống tự động cascade cập nhật cột `ho_ten` trên bảng `hoc_sinh_khoa_hoc` để đảm bảo tốc độ hiển thị danh sách lớp mà không bị lệch dữ liệu.

---

## 2. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & ERD)

```mermaid
erDiagram
    DOANH_NGHIEP ||--o{ HOC_SINH : "thuộc quản lý"
    DOANH_NGHIEP ||--o{ PHU_HUYNH : "thuộc quản lý"
    
    HOC_SINH }o--o{ PHU_HUYNH : "liên kết qua PH_HS"
    HOC_SINH ||--o{ PHU_HUYNH_HOC_SINH : "có danh sách phụ huynh"
    PHU_HUYNH ||--o{ PHU_HUYNH_HOC_SINH : "giám hộ các học sinh"
    
    HOC_SINH ||--o{ HOC_SINH_KHOA_HOC : "tham gia khóa"
    KHOA_HOC ||--o{ HOC_SINH_KHOA_HOC : "chứa học sinh"
    
    HOC_SINH ||--o{ DANG_KY_HOC : "sở hữu phiếu đăng ký"
    LOP_HOC ||--o{ DANG_KY_HOC : "được đăng ký vào"
    PHU_HUYNH ||--o{ DANG_KY_HOC : "đại diện nộp tiền"

    HOC_SINH {
        int id_hs PK "Auto Increment"
        int id_ph FK "Phụ huynh chính (Legacy ref)"
        int id_dn FK "Doanh nghiệp chủ quản"
        string ho_ten "Họ và tên học sinh (max 255)"
        date ngay_sinh "Ngày tháng năm sinh"
        string gioi_tinh "M (Nam) / F (Nữ)"
        string so_dien_thoai "SĐT cá nhân (nếu có)"
        string cccd "CCCD định danh (Unique per DN)"
        string dia_chi "Địa chỉ thường trú"
        bool xoa "Soft delete flag"
    }

    PHU_HUYNH {
        int id_ph PK "Auto Increment"
        int id_dn FK "Doanh nghiệp chủ quản"
        string ho_ten "Họ và tên phụ huynh"
        string sdt "Số điện thoại liên lạc chính"
        string cccd "CCCD phụ huynh"
        string email "Email liên hệ"
        bool xoa "Soft delete flag"
    }

    PHU_HUYNH_HOC_SINH {
        int id_ph_hs PK "Auto Increment"
        int id_ph FK "Mã phụ huynh"
        int id_hs FK "Mã học sinh"
        bool la_nguoi_dai_dien "Cờ đại diện chính (true/false)"
        string quan_he "Bố, Mẹ, Ông, Bà, Người giám hộ"
        bool xoa "Soft delete flag"
    }

    HOC_SINH_KHOA_HOC {
        int id_hs_kh PK "Auto Increment"
        int id_hs FK "Học sinh"
        int id_khoa_hoc FK "Khóa học"
        string ho_ten "Họ tên phi chuẩn hóa (denormalized)"
        int so_buoi_da_hoc "Lũy kế số buổi đã tham gia"
        date ngay_dang_ky "Ngày vào khóa"
        bool trang_thai "true: Đang học / false: Đã dừng"
        int id_dn FK "Doanh nghiệp"
        bool xoa "Soft delete flag"
    }

    DANG_KY_HOC {
        int id_dang_ky PK "Auto Increment"
        int id_hs FK "Học sinh"
        int id_lop FK "Lớp học"
        int id_ph FK "Phụ huynh đại diện"
        date ngay_dang_ky "Ngày lập phiếu đăng ký"
        bool trang_thai_thanh_toan "Đã thanh toán học phí chưa"
        decimal hoc_phi "Mức học phí áp dụng"
        int id_dn FK "Doanh nghiệp"
        bool xoa "Soft delete flag"
    }
```

---

## 3. CÁC LUỒNG NGHIỆP VỤ & THUẬT TOÁN SERVICE CHI TIẾT

### 3.1. Luồng Thêm mới / Cập nhật Phụ huynh thông minh (Auto Deduplication)
Hàm thực thi: `TaoMoiPhuHuynhChoHocSinhAsync(int idHs, TaoPhuHuynhChoHocSinhRequest request)`

```mermaid
flowchart TD
    Start([Nhận yêu cầu: idHs, hoTen, sdt, cccd, quanHe, laDaiDien]) --> Step1{Kiểm tra CCCD phụ huynh trong CSDL doanh nghiệp?}
    Step1 -- CCCD Đã tồn tại --> Reuse[Lấy bản ghi PhuHuynh hiện hữu]
    Step1 -- CCCD Chưa có --> CreateNew[Tạo mới bản ghi trong bảng phu_huynh]
    
    Reuse --> CheckRelation{Đã có liên kết giữa idHs và idPh chưa?}
    CreateNew --> CheckRelation
    
    CheckRelation -- Đã có liên kết cũ bị xóa mềm --> Restore[Khôi phục xoa = false, cập nhật quanHe, laDaiDien]
    CheckRelation -- Chưa có liên kết --> InsertPHHS[Thêm mới bản ghi vào bảng phu_huynh_hoc_sinh]
    CheckRelation -- Đang tồn tại hoạt động --> UpdatePHHS[Cập nhật quanHe và cờ la_nguoi_dai_dien]
    
    Restore --> Done[(Lưu vào CSDL & Trả về DTO)]
    InsertPHHS --> Done
    UpdatePHHS --> Done
```

### 3.2. Luồng Đồng bộ 2 chiều: Học sinh Khóa học $\leftrightarrow$ Đăng ký học (DangKyHoc Sync Engine)
Hàm thực thi: `GanHocSinhVaoKhoaHocAsync`, `GanNhieuHocSinhVaoKhoaHocAsync`, `XoaHocSinhKhoiKhoaHocAsync`

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Quản lý học vụ
    participant API as ChuDoanhNghiepStudentController / HocSinhKhoaHocController
    participant Svc as HocSinhService
    participant DB as MySQL DB

    Note over Staff, DB: GÁN HỌC SINH VÀO KHÓA HỌC
    Staff->>API: POST /api/doanh-nghiep/hoc-sinh-khoa-hoc (idHs, idKhoaHoc)
    API->>Svc: GanHocSinhVaoKhoaHocAsync(request)
    Svc->>DB: Kiểm tra học sinh đã có trong khóa học chưa
    Svc->>DB: Thêm bản ghi vào hoc_sinh_khoa_hoc (nạp kèm hoTen học sinh)
    
    Svc->>DB: Tra cứu Khóa học xem có thuộc Lớp học nào không (KhoaHoc.IdLop)
    alt Khóa học gắn với Lớp học (IdLop != null)
        Svc->>DB: Tìm bản ghi dang_ky_hoc(idHs, idLop)
        alt Đã có bản ghi bị xóa mềm
            Svc->>DB: Khôi phục xoa = false
        else Chưa có bản ghi
            Svc->>DB: Tạo mới DangKyHoc(idHs, idLop, ngayDangKy = Today, trangThaiThanhToan = false)
        end
    end
    Svc->>DB: SaveChangesAsync()
    API-->>Staff: 200 OK (Gán khóa học & đồng bộ đăng ký học thành công)

    Note over Staff, DB: XÓA HỌC SINH KHỎI KHÓA HỌC (CASCADE SOFT DELETE)
    Staff->>API: DELETE /api/doanh-nghiep/hoc-sinh-khoa-hoc/{idHs}/{idKhoaHoc}
    API->>Svc: XoaHocSinhKhoiKhoaHocAsync(idHs, idKhoaHoc)
    Svc->>DB: Đánh dấu hoc_sinh_khoa_hoc.xoa = true
    alt Khóa học gắn với Lớp học (IdLop != null)
        Svc->>DB: Đánh dấu dang_ky_hoc(idHs, idLop).xoa = true
    end
    Svc->>DB: SaveChangesAsync()
    API-->>Staff: 200 OK (Đã hủy gán khóa học và hủy đăng ký lớp)
```

---

## 4. MA TRẬN API ENDPOINTS CỦA MODULE HỌC SINH & PHỤ HUYNH

| Endpoint | Method | Phân quyền (Roles) | Chức năng nghiệp vụ & Logic kiểm tra |
| :--- | :---: | :--- | :--- |
| `/api/doanh-nghiep/hoc-sinh` | `GET` | Admin, Chủ DN, Quản lý | Lấy danh sách học sinh có phân trang, hỗ trợ lọc chi nhánh, từ khóa tìm kiếm. |
| `/api/hoc-sinh/{id}` | `GET` | Mọi vai trò xác thực | Xem chi tiết học sinh kèm danh sách phụ huynh liên kết. |
| `/api/doanh-nghiep/hoc-sinh` | `POST` | Admin, Chủ DN, Quản lý | Tạo học sinh mới, kiểm tra trùng số CCCD trong doanh nghiệp (báo 409 Conflict). |
| `/api/doanh-nghiep/hoc-sinh/{id}` | `PUT` | Admin, Chủ DN, Quản lý | Cập nhật hồ sơ học sinh, cascade đồng bộ `ho_ten` sang bảng `hoc_sinh_khoa_hoc`. |
| `/api/doanh-nghiep/hoc-sinh/{id}` | `DELETE` | Admin, Chủ DN | Xóa mềm học sinh (`xoa = true`), ngắt các liên kết đào tạo hiện thời. |
| `/api/hoc-sinh/{idHs}/phu-huynh` | `GET` | Mọi vai trò xác thực | Lấy danh sách toàn bộ phụ huynh/người giám hộ của học sinh. |
| `/api/phu-huynh/{idPh}/hoc-sinh` | `GET` | Mọi vai trò xác thực | Lấy danh sách tất cả các con đang học của một phụ huynh. |
| `/api/hoc-sinh/{idHs}/phu-huynh` | `POST` | Admin, Chủ DN, Quản lý | Thêm mới phụ huynh cho học sinh, tự động tái sử dụng hồ sơ nếu trùng CCCD. |
| `/api/phu-huynh-hoc-sinh` | `POST` | Admin, Chủ DN, Quản lý | Tạo liên kết giữa phụ huynh có sẵn và học sinh (gán cờ đại diện & mối quan hệ). |
| `/api/phu-huynh-hoc-sinh/{idPhHs}` | `DELETE` | Admin, Chủ DN, Quản lý | Xóa quan hệ phụ huynh - học sinh theo ID bản ghi trung gian. |
| `/api/phu-huynh-hoc-sinh/{idHs}/{idPh}`| `DELETE` | Admin, Chủ DN, Quản lý | Xóa quan hệ phụ huynh - học sinh theo cặp ID. |
| `/api/doanh-nghiep/hoc-sinh-khoa-hoc` | `POST` | Admin, Chủ DN, Quản lý | Gán học sinh vào khóa học, tự động đồng bộ tạo bản ghi `dang_ky_hoc`. |
| `/api/doanh-nghiep/hoc-sinh-khoa-hoc/hang-loat` | `POST` | Admin, Chủ DN, Quản lý | Gán hàng loạt học sinh vào khóa học trong 1 request. |
| `/api/doanh-nghiep/hoc-sinh-khoa-hoc/{idHs}/{idKhoaHoc}` | `DELETE` | Admin, Chủ DN, Quản lý | Xóa học sinh khỏi khóa học, cascade soft-delete bản ghi `dang_ky_hoc`. |
