# BẢN ĐỒ NGHIỆP VỤ & THIẾT KẾ CƠ SỞ DỮ LIỆU: ĐÀO TẠO, LỚP HỌC & THỜI KHÓA BIỂU
> **Module ID**: `06_DAO_TAO_LOP_HOC_THOI_KHOA_BIEU`  
> **Service cốt lõi**: `IDaoTaoService` / `DaoTaoService.cs`  
> **Controllers phụ trách**: `ChuDoanhNghiepDaoTaoController.cs`, `ChungDaoTaoController.cs`, `AdminDaoTaoController.cs`, `QuanLyLopHocController.cs`, `QuanLyThoiKhoaBieuController.cs`, `GiaoVienLopHocController.cs`, `GiaoVienThoiKhoaBieuController.cs`  
> **Trạng thái**: `[Đã hoàn thành - Đồng bộ 100% Java & .NET]`

---

## 1. TỔNG QUAN PHẠM VI NGHIỆP VỤ (MODULE OVERVIEW)

Module Đào tạo là "trái tim" vận hành của toàn bộ trung tâm giáo dục, đảm nhiệm chuỗi liên kết:
1. **Tổ chức lớp học**: Khởi tạo lớp học theo chi nhánh, kỳ học, môn học; phân công giáo viên phụ trách; quản lý sĩ số tối đa.
2. **Khóa học / Chương trình học**: Tạo các khóa học theo bộ môn / lớp học; theo dõi số tiết kế hoạch, số buổi đã dạy thực tế và tự động cập nhật trạng thái hoàn thành khóa học.
3. **Quản lý lịch học**:
   - *Khung lịch cố định*: Lịch mẫu theo thứ trong tuần và ca học.
   - *Thời khóa biểu tuần*: Lịch cụ thể theo tuần học, phòng học, giáo viên, thứ, ca học, giờ bắt đầu/kết thúc.
   - *Buổi học thực tế*: Sinh ra từ TKB tuần để làm căn cứ điểm danh và thanh toán công dạy.
4. **Đăng ký học & Tiếp nhận học sinh**: Ghi nhận học sinh tham gia lớp học, tính học phí cơ sở, đồng bộ trạng thái thanh toán và hỗ trợ rút hồ sơ / hủy đăng ký / xóa khỏi lớp.

---

## 2. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & ERD)

```mermaid
erDiagram
    DOANH_NGHIEP ||--o{ LOP_HOC : "sở hữu"
    CHI_NHANH ||--o{ LOP_HOC : "tổ chức tại"
    KY_HOC ||--o{ LOP_HOC : "thuộc kỳ"
    MON_HOC ||--o{ LOP_HOC : "dạy môn"
    GIAO_VIEN ||--o{ LOP_HOC : "chủ nhiệm / phụ trách"
    
    LOP_HOC ||--o{ KHOA_HOC : "chứa các"
    BO_MON ||--o{ KHOA_HOC : "thuộc bộ môn"
    
    LOP_HOC ||--o{ DANG_KY_HOC : "có học sinh đăng ký"
    HOC_SINH ||--o{ DANG_KY_HOC : "tham gia"
    PHU_HUYNH ||--o{ DANG_KY_HOC : "đại diện đăng ký"
    
    LOP_HOC ||--o{ KHUNG_LICH_HOC_CO_DINH : "áp dụng khung"
    PHONG_HOC ||--o{ KHUNG_LICH_HOC_CO_DINH : "học tại phòng"
    
    LOP_HOC ||--o{ THOI_KHOA_BIEU_TUAN : "xếp lịch tuần"
    TUAN_HOC ||--o{ THOI_KHOA_BIEU_TUAN : "vào tuần"
    PHONG_HOC ||--o{ THOI_KHOA_BIEU_TUAN : "học tại"
    GIAO_VIEN ||--o{ THOI_KHOA_BIEU_TUAN : "giảng dạy ca"
    
    THOI_KHOA_BIEU_TUAN ||--o{ BUOI_HOC : "sinh ra"
    KHOA_HOC ||--o{ BUOI_HOC : "tính vào tiến độ"
    LOP_HOC ||--o{ BUOI_HOC : "tổ chức buổi"
    PHONG_HOC ||--o{ BUOI_HOC : "diễn ra tại"

    LOP_HOC {
        int id_lop PK "Auto Increment"
        int id_cn FK "Chi nhánh tổ chức"
        int id_kh FK "Kỳ học"
        int id_gv FK "Giáo viên phụ trách"
        int id_mh FK "Môn học"
        string ten_lop "Tên lớp học (max 100)"
        string trang_thai "DangMo / DaKetThuc / TamDung"
        int si_so_toi_da "Sĩ số giới hạn"
        int id_dn FK "Doanh nghiệp chủ quản"
        bool xoa "Soft delete flag"
    }

    KHOA_HOC {
        int id_khoa_hoc PK "Auto Increment"
        int id_bo_mon FK "Bộ môn đào tạo"
        int id_lop FK "Lớp học liên kết"
        int id_mh FK "Môn học"
        string ten_khoa_hoc "Tên khóa học"
        int so_tiet "Tổng số tiết dự kiến"
        int so_buoi_da_day "Số buổi thực tế đã học"
        bool trang_thai_hoan_thanh "Đã học đủ tiết chưa"
        int id_dn FK "Doanh nghiệp"
        bool xoa "Soft delete flag"
    }

    DANG_KY_HOC {
        int id_dang_ky PK "Auto Increment"
        int id_hs FK "Học sinh"
        int id_lop FK "Lớp học"
        int id_ph FK "Phụ huynh liên hệ"
        date ngay_dang_ky "Ngày nộp đơn đăng ký"
        bool trang_thai_thanh_toan "Đã đóng tiền chưa"
        decimal hoc_phi "Mức học phí niêm yết"
        int id_dn FK "Doanh nghiệp"
        bool xoa "Soft delete flag"
    }

    THOI_KHOA_BIEU_TUAN {
        int id_tkb_tuan PK "Auto Increment"
        int id_lop FK "Lớp học"
        int id_th FK "Tuần học (TuanHoc)"
        int id_phong FK "Phòng học tổ chức"
        int id_giao_vien FK "Giáo viên giảng dạy"
        int thu "Thứ trong tuần (2 -> 8)"
        int ca_hoc "Ca học (1, 2, 3, 4, ...)"
        time gio_bat_dau "Giờ bắt đầu"
        time gio_ket_thuc "Giờ kết thúc"
        int id_dn FK "Doanh nghiệp"
        bool xoa "Soft delete flag"
    }

    BUOI_HOC {
        int id_buoi_hoc PK "Auto Increment"
        int id_tkb_tuan FK "TKB nguồn (nếu có)"
        int id_khoa_hoc FK "Khóa học ghi nhận"
        int id_lop FK "Lớp học"
        int id_phong FK "Phòng học thực tế"
        date ngay_hoc "Ngày diễn ra buổi học"
        int ca_hoc "Ca học"
        time gio_bat_dau "Giờ bắt đầu"
        time gio_ket_thuc "Giờ kết thúc"
        string noi_dung "Giáo án / Ghi chú buổi dạy"
        int id_dn FK "Doanh nghiệp"
        bool xoa "Soft delete flag"
    }
```

---

## 3. CÁC LUỒNG NGHIỆP VỤ & THUẬT TOÁN SERVICE CHI TIẾT

### 3.1. Thuật toán kiểm tra xung đột thời khóa biểu 3 lớp (Conflict Detection Engine)
Hàm thực thi: `LuuThoiKhoaBieuTuanAsync` & `LuuThoiKhoaBieuHangLoatAsync`

```mermaid
flowchart TD
    Start([Nhận yêu cầu xếp TKB: idLop, idTh, idPhong, idGiaoVien, thu, caHoc]) --> Step1{Kiểm tra xung đột nội bộ mảng gửi lên?}
    Step1 -- Có trùng lặp trong mảng --> Throw400Conflict["Báo lỗi 400: Dữ liệu gửi lên chứa lịch trùng lặp"]
    Step1 -- Hợp lệ nội bộ --> Step2{Lớp này đã có lịch ở Thứ & Ca này trong tuần?}
    Step2 -- Trùng Lớp --> ThrowConflictClass["Báo lỗi 409 Conflict: Lớp đã có lịch học vào Thứ ... Ca ..."]
    Step2 -- Không trùng --> Step3{Phòng học này đã bị lớp khác dùng ở Thứ & Ca này?}
    Step3 -- Trùng Phòng --> ThrowConflictRoom["Báo lỗi 409 Conflict: Phòng học đã có lớp khác sử dụng"]
    Step3 -- Không trùng --> Step4{Giáo viên này đã có ca dạy ở lớp khác cùng giờ?}
    Step4 -- Trùng Giáo viên --> ThrowConflictTeacher["Báo lỗi 409 Conflict: Giáo viên đã có lịch dạy vào thời gian này"]
    Step4 -- Không trùng --> SaveDB[(Lưu TKB vào CSDL với xoa = false)]
    SaveDB --> End([Hoàn tất xếp lịch tuần])
```

### 3.2. Luồng tự động sinh buổi học & Cập nhật tiến độ khóa học
Hàm thực thi: `TuDongSinhBuoiHocTheoTuanAsync`, `LuuBuoiHocAsync`, `XoaBuoiHocAsync`

```mermaid
sequenceDiagram
    autonumber
    actor User as Quản lý / Giáo viên
    participant API as ChuDoanhNghiepDaoTaoController
    participant Svc as DaoTaoService
    participant DB as QuanLyTrungTamDbContext (MySQL)

    User->>API: POST /api/doanh-nghiep/dao-tao/lop-hoc/{idLop}/sinh-buoi-hoc-tuan/{idTuan}
    API->>Svc: TuDongSinhBuoiHocTheoTuanAsync(idLop, idTuan)
    Svc->>DB: Lấy TKB tuần của lớp + Thông tin Tuần học (ngayBatDau -> ngayKetThuc)
    Svc->>DB: Lấy Khóa học liên kết với Lớp (idLop)
    loop Với từng bản ghi TKB tuần
        Svc->>Svc: Tính ngày học: ngayBatDauTuan + (thu - 2) ngày
        Svc->>DB: Kiểm tra xem Buổi học đã tồn tại chưa (!xoa && ngayHoc && caHoc)
        alt Chưa tồn tại
            Svc->>DB: Thêm BuoiHoc mới
            Svc->>DB: Cập nhật KhoaHoc.SoBuoiDaDay += 1
            alt SoBuoiDaDay >= SoTiet
                Svc->>DB: Set KhoaHoc.TrangThaiHoanThanh = true
            end
        end
    end
    Svc->>DB: SaveChangesAsync()
    Svc-->>API: Trả về danh sách BuoiHoc đã sinh
    API-->>User: 200 OK (Thành công)
```

### 3.3. Ràng buộc thời gian đào tạo (Historical Immutability Rule)
- **Quy tắc**: Hệ thống nghiêm cấm chỉnh sửa hoặc xóa Buổi học / TKB đã diễn ra trong quá khứ nhằm bảo toàn dữ liệu điểm danh và tính công lương.
- **Ràng buộc**:
  ```csharp
  if (buoiHoc.NgayHoc.HasValue && buoiHoc.NgayHoc.Value < DateOnly.FromDateTime(DateTime.Today))
  {
      return ApiResponse<bool>.BadRequest("Không được phép chỉnh sửa hoặc xóa buổi học đã diễn ra trong quá khứ.");
  }
  ```

---

## 4. MA TRẬN API ENDPOINTS CỦA MODULE ĐÀO TẠO

| Endpoint | Method | Phân quyền (Roles) | Chức năng nghiệp vụ & Logic kiểm tra |
| :--- | :---: | :--- | :--- |
| `/api/dao-tao/lop-hoc` | `GET` | Admin, Chủ DN, Quản lý | Lấy danh sách lớp học có phân trang, lọc theo chi nhánh, môn học, giáo viên, keyword. |
| `/api/dao-tao/lop-hoc/{id}` | `GET` | Mọi vai trò xác thực | Xem chi tiết lớp học kèm chi nhánh, kỳ học, môn học, giáo viên phụ trách. |
| `/api/dao-tao/lop-hoc` | `POST` | Admin, Chủ DN, Quản lý | Tạo lớp học mới, validate sĩ số tối đa > 0, kiểm tra chi nhánh thuộc doanh nghiệp. |
| `/api/dao-tao/lop-hoc/{id}` | `PUT` | Admin, Chủ DN, Quản lý | Cập nhật thông tin lớp, sĩ số, trạng thái. |
| `/api/dao-tao/lop-hoc/{id}` | `DELETE` | Admin, Chủ DN | Cascade soft-delete lớp học, khóa học trực thuộc và TKB liên quan. |
| `/api/dao-tao/lop-hoc/{id}/phan-cong-giao-vien/{idGv}` | `PUT` | Admin, Chủ DN, Quản lý | Phân công giáo viên chủ nhiệm, kiểm tra GV phải đang hoạt động tại chi nhánh. |
| `/api/dao-tao/khoa-hoc` | `GET` | Mọi vai trò xác thực | Lấy danh sách khóa học lọc theo môn, bộ môn hoặc lớp học. |
| `/api/dao-tao/khoa-hoc` | `POST` | Admin, Chủ DN, Quản lý | Tạo khóa học, gán số tiết dự kiến, khởi tạo `so_buoi_da_day = 0`, `trang_thai_hoan_thanh = false`. |
| `/api/dao-tao/thoi-khoa-bieu/tuan` | `POST` | Admin, Chủ DN, Quản lý | Lưu 1 bản ghi TKB tuần, kích hoạt thuật toán chống trùng 3 lớp. |
| `/api/dao-tao/thoi-khoa-bieu/tuan/hang-loat` | `POST` | Admin, Chủ DN, Quản lý | Lưu danh sách TKB, kiểm tra xung đột chéo nội bộ lô gửi lên trước khi lưu DB. |
| `/api/dao-tao/thoi-khoa-bieu/tuan/{id}` | `DELETE` | Admin, Chủ DN, Quản lý | Xóa TKB tuần, kiểm tra ràng buộc không xóa lịch trong quá khứ. |
| `/api/doanh-nghiep/dao-tao/lop-hoc/{idLop}/sinh-buoi-hoc-tuan/{idTuan}` | `POST` | Admin, Chủ DN, Quản lý | Sinh buổi học tự động từ TKB tuần, tăng `so_buoi_da_day` tương ứng. |
| `/api/dao-tao/dang-ky-hoc` | `POST` | Admin, Chủ DN, Quản lý | Đăng ký học sinh vào lớp, kiểm tra sĩ số chưa vượt mức, gán mức học phí. |
| `/api/dao-tao/dang-ky-hoc/{idDangKy}/huy` | `PUT` | Admin, Chủ DN, Quản lý | Hủy đăng ký học, cập nhật `trang_thai_thanh_toan = false`, ghi nhận trạng thái. |
| `/api/dao-tao/lop-hoc/{idLop}/xoa-hoc-sinh/{idHs}` | `DELETE` | Admin, Chủ DN, Quản lý | Xóa học sinh khỏi lớp, cascade soft-delete bản ghi `dang_ky_hoc`. |
