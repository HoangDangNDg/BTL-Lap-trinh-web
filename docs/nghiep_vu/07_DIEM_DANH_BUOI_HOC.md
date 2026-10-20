# BẢN ĐỒ NGHIỆP VỤ & THIẾT KẾ CƠ SỞ DỮ LIỆU: ĐIỂM DANH BUỔI HỌC
> **Module ID**: `07_DIEM_DANH_BUOI_HOC`  
> **Service cốt lõi**: `IDiemDanhService` / `DiemDanhService.cs`  
> **Controllers phụ trách**: `GiaoVienDiemDanhController.cs`, `QuanLyDiemDanhController.cs`  
> **Trạng thái**: `[Đã hoàn thành - Đồng bộ 100% Java & .NET]`

---

## 1. TỔNG QUAN PHẠM VI NGHIỆP VỤ (MODULE OVERVIEW)

Module Điểm danh theo dõi mức độ chuyên cần của học sinh và xác nhận giờ dạy thực tế của giáo viên:
1. **Điểm danh học sinh theo Buổi học (Batch Attendance Engine)**:
   - Cơ chế điểm danh thông minh: Giáo viên chỉ cần tích chọn các học sinh có mặt.
   - Thuật toán bù vắng mặt: Hệ thống tự động truy vấn toàn bộ danh sách học sinh đã đăng ký lớp học/khóa học; học sinh nào không được tích chọn sẽ tự động được lưu bản ghi với trạng thái vắng mặt (`trang_thai = false`). Tuyệt đối không bỏ sót học sinh trong sổ điểm danh.
   - Tự động tích lũy số buổi đã học: Khi học sinh có mặt (`trang_thai = true`), hệ thống tự động tăng `so_buoi_da_hoc` trong bảng `hoc_sinh_khoa_hoc`.
2. **Điểm danh ca dạy Giáo viên (Teacher Work-Shift Verification)**:
   - Ghi nhận trạng thái dạy học của giáo viên tại từng buổi: `CoMat` (Có mặt giảng dạy), `VangCoPhep` (Xin nghỉ phép trước), `VangKhongPhep`, `DayThay` (Giáo viên khác dạy thay ca).
   - Dữ liệu này là căn cứ trực tiếp để Module Tài chính (`TaiChinhService`) tính giờ công thanh toán lương giáo viên.
3. **Tra cứu lịch sử chuyên cần & Sổ liên lạc**:
   - Cho phép tra cứu lịch sử điểm danh theo từng buổi học, theo học sinh cụ thể hoặc theo toàn bộ khóa học để xuất báo cáo chuyên cần gửi phụ huynh.

---

## 2. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & ERD)

```mermaid
erDiagram
    BUOI_HOC ||--o{ DIEM_DANH_HOC_SINH : "có danh sách điểm danh"
    HOC_SINH ||--o{ DIEM_DANH_HOC_SINH : "được điểm danh"
    KHOA_HOC ||--o{ DIEM_DANH_HOC_SINH : "ghi nhận buổi của khóa"
    
    BUOI_HOC ||--o{ DIEM_DANH_GIAO_VIEN : "xác nhận ca dạy"
    GIAO_VIEN ||--o{ DIEM_DANH_GIAO_VIEN : "chấm công"
    
    DOANH_NGHIEP ||--o{ DIEM_DANH_HOC_SINH : "thuộc quyền sở hữu"
    DOANH_NGHIEP ||--o{ DIEM_DANH_GIAO_VIEN : "thuộc quyền sở hữu"

    DIEM_DANH_HOC_SINH {
        int id_diem_danh PK "Auto Increment"
        int id_buoi_hoc FK "Buổi học thực tế"
        int id_khoa_hoc FK "Khóa học liên kết"
        int id_hs FK "Học sinh được điểm danh"
        bool trang_thai "true: Có mặt / false: Vắng mặt"
        int id_dn FK "Doanh nghiệp chủ quản"
        bool xoa "Soft delete flag"
    }

    DIEM_DANH_GIAO_VIEN {
        int id_diem_danh PK "Auto Increment"
        int id_buoi_hoc FK "Buổi học chấm công"
        int id_gv FK "Giáo viên đứng lớp"
        string trang_thai "CoMat / VangCoPhep / VangKhongPhep / DayThay"
        int id_dn FK "Doanh nghiệp chủ quản"
        bool xoa "Soft delete flag"
    }

    BUOI_HOC {
        int id_buoi_hoc PK "Khóa chính"
        int id_lop FK "Lớp học"
        int id_khoa_hoc FK "Khóa học"
        date ngay_hoc "Ngày học"
        int ca_hoc "Ca học"
    }

    HOC_SINH {
        int id_hs PK "Khóa chính"
        string ho_ten "Họ tên học sinh"
        string so_dien_thoai "SĐT"
        string cccd "CCCD"
    }
```

---

## 3. CÁC LUỒNG NGHIỆP VỤ & THUẬT TOÁN SERVICE CHI TIẾT

### 3.1. Thuật toán Lưu điểm danh Batch & Bù tự động vắng mặt (Auto Backfill Absence)
Hàm thực thi: `LuuDiemDanhHocSinhBatchAsync(LuuDiemDanhBuoiHocRequest request)`

```mermaid
flowchart TD
    Start([Nhận yêu cầu: idBuoiHoc, danhSachDiemDanh]) --> Step1[Lấy thông tin BuoiHoc từ CSDL để biết idLop và idKhoaHoc]
    Step1 --> Step2[Truy vấn toàn bộ học sinh đang theo học lớp này từ hoc_sinh_khoa_hoc & dang_ky_hoc]
    
    Step2 --> Step3[Tập hợp danh sách ID học sinh có mặt gửi lên từ client: presentStudentIds]
    
    Step3 --> LoopStart[Duyệt qua TẤT CẢ học sinh của lớp]
    LoopStart --> CheckPresent{idHs có nằm trong presentStudentIds?}
    
    CheckPresent -- Có mặt --> SetStatusTrue[Gán trang_thai = true]
    CheckPresent -- Không có mặt --> SetStatusFalse[Tự động bù vắng mặt: Gán trang_thai = false]
    
    SetStatusTrue --> SaveRecord[(Lưu hoặc Cập nhật bản ghi diem_danh_hoc_sinh)]
    SetStatusFalse --> SaveRecord
    
    SaveRecord --> UpdateProgress[Cập nhật số buổi đã tích lũy trong hoc_sinh_khoa_hoc]
    UpdateProgress --> NextStudent{Còn học sinh trong lớp?}
    NextStudent -- Còn --> LoopStart
    NextStudent -- Hết --> SaveDB[(Commit Transaction & Lưu CSDL)]
    SaveDB --> End([Hoàn tất điểm danh: Sổ điểm danh 100% đầy đủ])
```

### 3.2. Luồng Điểm danh Giáo viên & Liên kết tính lương
Hàm thực thi: `DiemDanhGiaoVienAsync(DiemDanhGiaoVienRequest request)`

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Quản lý cơ sở / Giáo viên
    participant API as GiaoVienDiemDanhController / QuanLyDiemDanhController
    participant Svc as DiemDanhService
    participant DB as MySQL DB

    Staff->>API: POST /api/buoi-hoc/{idBuoiHoc}/diem-danh-giao-vien
    API->>Svc: DiemDanhGiaoVienAsync(request)
    Svc->>DB: Kiểm tra xem buổi học đã được điểm danh GV chưa
    alt Đã tồn tại bản ghi điểm danh
        Svc->>DB: Cập nhật trạng thái (CoMat / VangCoPhep / DayThay)
    else Chưa có bản ghi
        Svc->>DB: Thêm mới DiemDanhGiaoVien(idBuoiHoc, idGv, trangThai)
    end
    Svc->>DB: SaveChangesAsync()
    Svc-->>API: Trả về bản ghi điểm danh giáo viên
    API-->>Staff: 200 OK (Chấm công thành công)
```

---

## 4. MA TRẬN API ENDPOINTS CỦA MODULE ĐIỂM DANH

| Endpoint | Method | Phân quyền (Roles) | Chức năng nghiệp vụ & Logic kiểm tra |
| :--- | :---: | :--- | :--- |
| `/api/diem-danh/buoi-hoc/{idBuoiHoc}` | `GET` | Mọi vai trò xác thực | Lấy danh sách điểm danh chi tiết từng học sinh của một buổi học cụ thể. |
| `/api/buoi-hoc/{idBuoiHoc}/diem-danh-hoc-sinh` | `POST` | Giáo viên, Quản lý, Chủ DN | Lưu điểm danh batch học sinh, kích hoạt thuật toán tự động bù vắng mặt cho học sinh còn lại. |
| `/api/khoa-hoc/{idKhoaHoc}/diem-danh-hoc-sinh` | `GET` | Mọi vai trò xác thực | Xem lịch sử chuyên cần của học sinh trong toàn bộ khóa học. |
| `/api/buoi-hoc/{idBuoiHoc}/diem-danh-giao-vien` | `GET` | Quản lý, Giáo viên, Chủ DN | Tra cứu thông tin điểm danh chấm công ca dạy của buổi học. |
| `/api/buoi-hoc/{idBuoiHoc}/diem-danh-giao-vien` | `POST` | Quản lý, Chủ DN | Chấm công giáo viên đứng lớp (CoMat, VangCoPhep, DayThay). |
| `/api/giao-vien/{idGv}/lich-su-diem-danh` | `GET` | Giáo viên, Quản lý, Chủ DN | Tra cứu toàn bộ lịch sử ca dạy của giáo viên làm căn cứ đối soát bảng lương. |
