# BẢN ĐỒ NGHIỆP VỤ & THIẾT KẾ CƠ SỞ DỮ LIỆU: NHÂN SỰ, GIÁO VIÊN & HỒ SƠ
> **Module ID**: `03_NHAN_SU_GIAO_VIEN_HO_SO`  
> **Service cốt lõi**: `INhanSuService` / `NhanSuService.cs`  
> **Controllers phụ trách**: `ChuDoanhNghiepNhanSuController.cs`, `GiaoVienHoSoController.cs`, `QuanLyNhanSuController.cs`  
> **Trạng thái**: `[Đã hoàn thành - Đồng bộ 100% Java & .NET]`

---

## 1. TỔNG QUAN PHẠM VI NGHIỆP VỤ (MODULE OVERVIEW)

Module Nhân sự & Giáo viên phụ trách toàn bộ chuỗi quản lý lực lượng giảng dạy và lao động hỗ trợ:
1. **Hồ sơ Giáo viên & Bằng cấp / Chứng chỉ**:
   - Quản lý thông tin cơ bản: Họ tên, Giới tính, Ngày sinh, SĐT, Email, Trạng thái hoạt động.
   - Chi tiết chuyên sâu (`chi_tiet_gv`): Số CCCD, Trình độ học vấn, Ngày vào làm, Thông tin liên hệ người thân khi khẩn cấp, Ảnh đại diện.
   - Văn bằng & Chứng chỉ (`chung_chi_giao_vien`): Lưu trữ tên chứng chỉ, ngày cấp, ảnh chụp minh chứng.
   - Phân bổ Chuyên môn (`giao_vien_chuyen_mon`) và Chi nhánh làm việc (`giao_vien_chi_nhanh`).
2. **Quy trình Nhập giáo viên hàng loạt (Bulk Import Teachers Engine)**:
   - Cho phép doanh nghiệp nạp danh sách giảng viên lớn qua file Excel/JSON với quy chuẩn an toàn cao:
     - Giới hạn tối đa **50 bản ghi/lần gửi**.
     - Kiểm tra xác thực quyền sở hữu chi nhánh (`idCn` phải thuộc `idDn`).
     - Thuật toán chống trùng SĐT 2 lớp (trong nội bộ mảng gửi lên và đối soát với CSDL).
     - Kiểm tra tính hợp lệ của định dạng số CCCD 12 chữ số.
     - Toàn bộ lô nạp được bọc trong **Database Transaction**: Tạo bản ghi Giáo viên, Chi tiết giáo viên, Chi nhánh công tác và **tự động cấp tài khoản đăng nhập với mật khẩu băm BCrypt**.
     - Báo cáo kết quả chi tiết từng dòng (`tongSo`, `thanhCong`, `thatBai`, `danhSachLoi`).
3. **Bảo mật Hồ sơ & Chứng chỉ cá nhân (Ownership Security Protocol)**:
   - Nghiêm cấm can thiệp chéo: Giáo viên đăng nhập chỉ có quyền xem, chỉnh sửa hồ sơ và thêm/xóa các chứng chỉ thuộc quyền sở hữu của chính mình (`idGv == currentUserId`).
4. **Quản lý Nhân công khác (`nhan_cong_khac`)**: Quản lý đội ngũ nhân viên thời vụ, bảo vệ, tạp vụ theo từng chi nhánh cơ sở.

---

## 2. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & ERD)

```mermaid
erDiagram
    DOANH_NGHIEP ||--o{ GIAO_VIEN : "tuyển dụng"
    GIAO_VIEN ||--o| CHI_TIET_GV : "có hồ sơ chi tiết"
    GIAO_VIEN ||--o{ CHUNG_CHI_GIAO_VIEN : "sở hữu văn bằng"
    
    GIAO_VIEN }o--o{ CHI_NHANH : "công tác tại"
    GIAO_VIEN ||--o{ GIAO_VIEN_CHI_NHANH : "phân bổ chi nhánh"
    CHI_NHANH ||--o{ GIAO_VIEN_CHI_NHANH : "tiếp nhận giáo viên"
    
    GIAO_VIEN }o--o{ CHUYEN_MON : "giảng dạy"
    GIAO_VIEN ||--o{ GIAO_VIEN_CHUYEN_MON : "đảm nhiệm môn"
    CHUYEN_MON ||--o{ GIAO_VIEN_CHUYEN_MON : "thuộc lĩnh vực"
    
    DOANH_NGHIEP ||--o{ NHAN_CONG_KHAC : "thuê lao động"
    CHI_NHANH ||--o{ NHAN_CONG_KHAC : "làm việc tại"

    GIAO_VIEN {
        int id_gv PK "Auto Increment"
        int id_dn FK "Doanh nghiệp tuyển dụng"
        string ho_ten "Họ và tên giáo viên (max 255)"
        string gioi_tinh "M (Nam) / F (Nữ)"
        date ngay_sinh "Ngày tháng năm sinh"
        string sdt "Số điện thoại chính (Unique per DN)"
        string email "Email liên hệ"
        bool con_hoat_dong "true: Đang dạy / false: Tạm nghỉ"
        bool xoa "Soft delete flag"
    }

    CHI_TIET_GV {
        int id_chi_tiet_gv PK "Auto Increment"
        int id_gv FK "Khóa ngoại GiaoVien"
        bigint cccd "Số CCCD định danh 12 số"
        string url_anh "Ảnh chân dung giáo viên"
        string trinh_do "Học vị (Cử nhân, ThS, TS)"
        string dia_chi "Địa chỉ thường trú"
        date ngay_vao_lam "Ngày ký hợp đồng"
        string sdt_nguoi_than "SĐT liên hệ khẩn cấp"
        string ten_nguoi_than "Tên người thân"
        bool xoa "Soft delete flag"
    }

    CHUNG_CHI_GIAO_VIEN {
        int id_chung_chi PK "Auto Increment"
        int id_gv FK "Khóa ngoại GiaoVien"
        string ten_chung_chi "Tên chứng chỉ / Văn bằng"
        date ngay_cap "Ngày cấp chứng chỉ"
        string url_anh "Đường dẫn ảnh chứng chỉ scan"
        int id_dn FK "Doanh nghiệp chủ quản"
        bool xoa "Soft delete flag"
    }

    GIAO_VIEN_CHI_NHANH {
        int id PK "Auto Increment"
        int id_gv FK "Mã giáo viên"
        int id_cn FK "Mã chi nhánh cơ sở"
    }

    GIAO_VIEN_CHUYEN_MON {
        int id PK "Auto Increment"
        int id_gv FK "Mã giáo viên"
        int id_cm FK "Mã chuyên môn giảng dạy"
    }

    NHAN_CONG_KHAC {
        int id_nc PK "Auto Increment"
        int id_cn FK "Chi nhánh làm việc"
        int id_dn FK "Doanh nghiệp chủ quản"
        string ho_ten "Họ tên nhân sự"
        string cong_viec "Vị trí (Bảo vệ, Tạp vụ, CSVC)"
        string sdt "SĐT liên hệ"
        decimal luong "Mức lương thỏa thuận"
        bool xoa "Soft delete flag"
    }
```

---

## 3. CÁC LUỒNG NGHIỆP VỤ & THUẬT TOÁN SERVICE CHI TIẾT

### 3.1. Thuật toán Nhập giáo viên hàng loạt an toàn (Transactional Bulk Import Engine)
Hàm thực thi: `LuuGiaoVienHangLoatAsync(int idDn, List<GiaoVienBulkDto> danhSach)`

```mermaid
flowchart TD
    Start([Nhận danh sách giáo viên: tối đa 50 bản ghi]) --> CheckSize{Số lượng > 50?}
    CheckSize -- Vượt quá 50 --> Throw400["Báo lỗi 400: Chỉ được import tối đa 50 bản ghi/lần"]
    CheckSize -- <= 50 bản ghi --> ValidateBranches[Kiểm tra các idCn gửi lên phải thuộc Doanh nghiệp idDn]
    
    ValidateBranches --> CheckInternalDup{Trùng SĐT nội bộ trong mảng gửi lên?}
    CheckInternalDup -- Có trùng nội bộ --> RecordInternalDupError[Ghi nhận lỗi trùng SĐT vào danhSachLoi]
    
    CheckInternalDup -- Không trùng nội bộ --> StartTran[(Bắt đầu Database Transaction)]
    
    StartTran --> LoopRecords[Duyệt từng giáo viên trong danh sách]
    LoopRecords --> CheckDbDup{SĐT đã tồn tại trong CSDL doanh nghiệp?}
    CheckDbDup -- Đã có trong CSDL --> LogDbDup[Báo lỗi dòng: SĐT đã được sử dụng]
    CheckDbDup -- Chưa có --> CheckCccd{CCCD đúng 12 số?}
    CheckCccd -- Sai định dạng --> LogCccdError[Báo lỗi dòng: CCCD không hợp lệ]
    
    CheckCccd -- Hợp lệ --> CreateGV[1. Tạo bản ghi bảng giao_vien]
    CreateGV --> CreateDetail[2. Tạo bản ghi chi_tiet_gv: CCCD, Trình độ, Địa chỉ]
    CreateDetail --> CreateBranchRef[3. Tạo liên kết giao_vien_chi_nhanh]
    CreateBranchRef --> AutoCreateAcc{Yêu cầu tạo tài khoản?}
    
    AutoCreateAcc -- Có --> CreateUser[Tạo TaiKhoan mã hóa BCrypt + Gán role ROLE_GIAO_VIEN]
    AutoCreateAcc -- Không --> NextRecord
    CreateUser --> NextRecord{Còn bản ghi tiếp theo?}
    
    NextRecord -- Còn --> LoopRecords
    NextRecord -- Hết --> CommitTran[(Commit Transaction CSDL)]
    CommitTran --> ReturnStats([Trả về kết quả: tongSo, thanhCong, thatBai, danhSachLoi])
```

### 3.2. Luồng Bảo vệ quyền sở hữu Chứng chỉ cá nhân
Hàm thực thi: `GiaoVienHoSoController.ThemChungChiGiaoVien`, `XoaChungChiGiaoVien`
- **Nguyên tắc bảo mật**:
  ```csharp
  // Lấy ID giáo viên đang đăng nhập từ JWT Token
  int currentGvId = LayIdGiaoVienHienTai();
  if (currentGvId != idGv)
  {
      return ApiResponse<bool>.Forbidden("Bạn không có quyền can thiệp vào hồ sơ giáo viên khác.");
  }
  ```

---

## 4. MA TRẬN API ENDPOINTS CỦA MODULE NHÂN SỰ & GIÁO VIÊN

| Endpoint | Method | Phân quyền (Roles) | Chức năng nghiệp vụ & Logic kiểm tra |
| :--- | :---: | :--- | :--- |
| `/api/doanh-nghiep/nhan-su/teachers` | `GET` | Admin, Chủ DN, Quản lý | Lấy danh sách giáo viên có phân trang, lọc theo chi nhánh, chuyên môn, keyword. |
| `/api/doanh-nghiep/giao-vien/{id}` | `GET` | Mọi vai trò xác thực | Xem chi tiết hồ sơ giáo viên kèm bằng cấp và chi nhánh công tác. |
| `/api/doanh-nghiep/giao-vien` | `POST` | Admin, Chủ DN, Quản lý | Thêm mới 1 giáo viên, kiểm tra trùng SĐT trong doanh nghiệp (409 Conflict). |
| `/api/doanh-nghiep/nhan-su/teachers/bulk` | `POST` | Admin, Chủ DN, Quản lý | **Import giáo viên hàng loạt** (tối đa 50 bản ghi, Transaction, tự cấp tài khoản). |
| `/api/doanh-nghiep/giao-vien/{id}` | `PUT` | Admin, Chủ DN, Quản lý | Cập nhật thông tin cơ bản của giáo viên. |
| `/api/doanh-nghiep/giao-vien/{id}` | `DELETE` | Admin, Chủ DN | Xóa mềm giáo viên (`xoa = true`), khóa tài khoản đăng nhập tương ứng. |
| `/api/giao-vien/ho-so/me` | `GET` | Giáo viên | Giáo viên xem thông tin hồ sơ cá nhân và chuyên môn của chính mình. |
| `/api/giao-vien/ho-so/me` | `PUT` | Giáo viên | Giáo viên cập nhật địa chỉ, SĐT khẩn cấp của người thân. |
| `/api/giao-vien/{idGv}/chung-chi` | `GET` | Giáo viên, Quản lý, Chủ DN | Lấy danh sách chứng chỉ văn bằng của giáo viên. |
| `/api/giao-vien/ho-so/chung-chi` | `POST` | Giáo viên | Thêm mới chứng chỉ cá nhân, upload ảnh scan văn bằng. |
| `/api/giao-vien/ho-so/chung-chi/{id}` | `DELETE` | Giáo viên | Xóa chứng chỉ cá nhân (kiểm tra quyền sở hữu). |
| `/api/doanh-nghiep/{idDn}/chi-nhanh/{idCn}/nhan-cong` | `GET` | Admin, Chủ DN, Quản lý | Lấy danh sách nhân công hỗ trợ (bảo vệ, tạp vụ) tại chi nhánh. |
| `/api/doanh-nghiep/nhan-cong` | `POST` | Admin, Chủ DN, Quản lý | Thêm mới nhân công khác kèm thỏa thuận mức lương. |
| `/api/doanh-nghiep/nhan-cong/{id}` | `DELETE` | Admin, Chủ DN, Quản lý | Xóa mềm nhân công khác. |
