# KẾ HOẠCH CHI TIẾT ĐỒNG BỘ LOGIC BACKEND .NET ↔ JAVA

Tài liệu này lưu trữ toàn bộ danh sách nhiệm vụ được chia nhỏ theo từng module để tiến hành chuẩn hóa logic nghiệp vụ của **.NET Backend** bám sát 100% **Java Backend**. Mỗi khi hoàn thành một nhiệm vụ, trạng thái sẽ được cập nhật trực tiếp tại đây.

---

## 📌 TIẾN ĐỘ TỔNG QUAN

- [x] **Giai đoạn 1: Bảo mật, Giao dịch đa bảng & Toàn vẹn tổ chức** *(Đã hoàn thành)*
- [x] **Giai đoạn 2: Nghiệp vụ Học sinh & Khóa học & Đồng bộ Đăng ký học** *(Đã hoàn thành)*
- [x] **Giai đoạn 3: Nghiệp vụ Đào tạo & Điểm danh & Tuần học** *(Đã hoàn thành)*
- [x] **Giai đoạn 4: Nghiệp vụ Tài chính cơ bản & Sổ quỹ** *(Đã hoàn thành)*
- [x] **Giai đoạn 5: Hoàn thiện Nghiệp vụ Đăng ký học & Ràng buộc thời gian Đào tạo** *(Đã hoàn thành)*
- [x] **Giai đoạn 6: Nghiệp vụ Hoàn trả Bảo lưu & Đồng bộ Học phí** *(Đã hoàn thành)*
- [x] **Giai đoạn 7: Động cơ Rollup Báo cáo Thu Chi 4 cấp (Tuần - Tháng - Kỳ - Năm)** *(Đã hoàn thành)*
- [x] **Giai đoạn 8: Phụ huynh - Học sinh (Bảng trung gian & Quan hệ đa chiều)** *(Đã hoàn thành)*
- [x] **Giai đoạn 9: Nhân sự nâng cao & Import giáo viên hàng loạt** *(Đã hoàn thành)*
- [x] **Giai đoạn 10: Rà soát toàn diện API Endpoints & Mã lỗi chuẩn hóa** *(Đã hoàn thành)*

---

## 📝 DANH SÁCH CHI TIẾT TỪNG NHIỆM VỤ

### ✅ Giai đoạn 1: Bảo mật, Giao dịch & Toàn vẹn tổ chức (HOÀN THÀNH)
- [x] `AdminService.cs`: Bọc Transaction `BeginTransactionAsync`, cascade khóa `TaiKhoan` khi xóa Admin, kiểm tra trùng username, hỗ trợ gán Doanh nghiệp có sẵn.
- [x] `DoanhNghiepService.cs`: Cascade khóa toàn bộ tài khoản nhân sự (GV, QL, CCD) và thu hồi toàn bộ `RefreshToken` khi xóa Doanh nghiệp.
- [x] `DoanhNghiepService.cs`: Sửa `TaoQuanLyChiNhanhAsync` gán đúng `IdDn` từ chi nhánh, kiểm tra trùng username, bọc Transaction.
- [x] `NhanSuService.cs`: Bọc Transaction trong `TaoTaiKhoanChoGiaoVienAsync`.
- [x] `GiaoVienHoSoController.cs`: Kiểm tra quyền sở hữu chứng chỉ theo GV đăng nhập, ngăn chặn sửa/xóa chéo.

### ✅ Giai đoạn 2: Nghiệp vụ Học sinh & Khóa học (HOÀN THÀNH)
- [x] `HocSinhService.cs`: Kiểm tra trùng số CCCD khi tạo mới và cập nhật học sinh (báo 409 Conflict).
- [x] `HocSinhService.cs`: Cascade cập nhật họ tên vào cột denormalized `ho_ten` trên bảng `hoc_sinh_khoa_hoc`.
- [x] `HocSinhService.cs`: `GanHocSinhVaoKhoaHocAsync` tự động đồng bộ tạo/khôi phục bản ghi `DangKyHoc` nếu khóa học thuộc lớp.
- [x] `HocSinhService.cs`: `GanNhieuHocSinhVaoKhoaHocAsync` tự động đồng bộ hàng loạt sang `DangKyHoc`.
- [x] `HocSinhService.cs`: `XoaHocSinhKhoiKhoaHocAsync` cascade soft-delete bản ghi tương ứng trong `DangKyHoc`.

### ✅ Giai đoạn 3: Nghiệp vụ Đào tạo & Điểm danh & Tuần học (HOÀN THÀNH)
- [x] `DaoTaoService.cs`: Tự động tăng `KhoaHoc.SoBuoiDaDay += 1` khi tạo buổi học (hoặc `+N` khi sinh hàng loạt) và tự động set `TrangThaiHoanThanh = true` khi đạt `SoTiet`.
- [x] `DaoTaoService.cs`: Tự động giảm `KhoaHoc.SoBuoiDaDay -= 1` và reset `TrangThaiHoanThanh = false` khi xóa buổi học.
- [x] `DaoTaoService.cs`: `LuuThoiKhoaBieuTuanAsync` kiểm tra xung đột 3 lớp: Trùng phòng học, Trùng lớp học, Trùng ca dạy của Giáo viên.
- [x] `DaoTaoService.cs`: `LuuThoiKhoaBieuHangLoatAsync` kiểm tra xung đột nội bộ mảng dữ liệu gửi lên.
- [x] `DiemDanhService.cs`: `LuuDiemDanhHocSinhBatchAsync` tự động nạp toàn bộ danh sách lớp/khóa học; học sinh vắng mặt được tự động lưu trạng thái `false` (không bỏ sót bản ghi).
- [x] `CoSoVatChatService.cs`: `TaoTuanHocHangLoatAsync` tự động tạo 2 kỳ học nếu chưa có; đánh số tuần liên tục xuyên suốt năm học (1..36) không bị reset về 1; chống tạo trùng lặp số tuần.

### ✅ Giai đoạn 4: Nghiệp vụ Tài chính cơ bản & Sổ quỹ (HOÀN THÀNH)
- [x] `TaiChinhService.cs`: `LapPhieuThuHocPhiAsync` tự động tra cứu Chi nhánh (`IdCn`) và Doanh nghiệp (`IdDn`) từ lớp học/học sinh thay vì gán cứng `IdCn = 1`.
- [x] `TaiChinhService.cs`: `ThanhToanLuongGiaoVienAsync` tự động tìm Chi nhánh công tác của giáo viên thay vì gán cứng `IdCn = 1`.
- [x] `TaiChinhService.cs`: `XoaThanhToanGiaoVienAsync` tự động tìm và hủy (soft-delete) bản ghi `SoQuyThuChi` tương ứng, ngăn chặn chi phí ảo.
- [x] `TaiChinhService.cs`: `TaoBaoLuuAsync` tự động liên kết hoặc tạo `DangKyHoc` hợp lệ, không gán cứng `IdDangKy = 1`.

---

### ✅ Giai đoạn 5: Hoàn thiện Nghiệp vụ Đăng ký học & Ràng buộc thời gian Đào tạo (HOÀN THÀNH)
- [x] `IDaoTaoService.cs` & `DaoTaoService.cs`: Thêm các hàm nghiệp vụ:
  - `DangKyHocAsync(int idHs, int idLop, int? idPh = null, decimal? hocPhi = null)`
  - `HuyDangKyHocAsync(int idDangKy)`
  - `XoaDangKyHocAsync(int idDangKy)`
  - `XoaHocSinhKhoiLopAsync(int idHs, int idLop)`
  - `LayDanhSachDangKyTheoDoanhNghiepAsync`
  - `LayDanhSachDangKyTheoChiNhanhAsync`
- [x] `DaoTaoService.cs`: Ràng buộc thời gian: Không cho phép sửa/xóa TKB hoặc Buổi học đã diễn ra trong quá khứ (`NgayHoc < DateOnly.FromDateTime(DateTime.Today)`).
- [x] `CoSoVatChatService.cs`: Thêm logic `DoiTrangThaiHoanThanhNamHocAsync` chỉ cho phép đổi trạng thái trong vòng ±1 tháng quanh ngày kết thúc năm học (như Java).
- [x] Đồng bộ Controllers: `ChuDoanhNghiepStudentController.cs`, `ChungDaoTaoController.cs`, `AdminDaoTaoController.cs`.

---

### ✅ Giai đoạn 6: Nghiệp vụ Hoàn trả Bảo lưu & Đồng bộ Học phí (HOÀN THÀNH)
- [x] `ITaiChinhService.cs` & `TaiChinhService.cs`: Thêm nghiệp vụ `HoanTraBaoLuuAsync(int idBaoLuu)`:
  - Khôi phục trạng thái học của học sinh trong lớp (`TrangThai = true`).
  - Ghi nhận `NgayHoanTra = DateOnly.FromDateTime(DateTime.Today)`.
  - Cập nhật trạng thái bảo lưu `TrangThaiBaoLuu = false`.
  - Khôi phục trạng thái `DangKyHoc` nếu có.
- [x] `TaiChinhService.cs`: Cập nhật `LapPhieuThuHocPhiAsync` tự động kích hoạt `DangKyHoc.TrangThaiThanhToan = true`, nạp tiến độ học phí vào `ThanhToanHocPhiKhoaHocHocSinh`.
- [x] Controllers: Đã mở endpoint `HoanTraBaoLuu` trên `ChuDoanhNghiepTaiChinhController`, `QuanLyHoSoHocSinh360Controller`, `ChuDoanhNghiepStudentController`.

---

### ✅ Giai đoạn 7: Động cơ Rollup Báo cáo Thu Chi 4 cấp (Tuần - Tháng - Kỳ - Năm) (HOÀN THÀNH)
- [x] `TaiChinhService.cs`: Xây dựng hàm lõi `CapNhatRollupThuChiAsync(int idDn, int idCn, DateOnly ngayGiaoDich, decimal tienThu, decimal tienChi, string? ghiChu)`:
  - Tự động phân giải Kỳ học và Năm học theo khoảng ngày giao dịch.
  - Tự động tìm hoặc khởi tạo Tháng học (`ThangHoc`) cho tháng/năm tương ứng.
  - Tự động tìm Tuần học (`TuanHoc`) bao hàm ngày giao dịch.
  - Rollup O(1) vào `thu_chi_tuan_hoc`, `thu_chi_thang_hoc`, `thu_chi_ky_hoc`, `thu_chi_nam_hoc`.
- [x] Tích hợp Rollup vào:
  - `LapPhieuThuHocPhiAsync` (Loại: THU).
  - `ThanhToanLuongGiaoVienAsync` (Loại: CHI).
  - `XoaThanhToanGiaoVienAsync` (Hoàn tác CHI).
  - `GhiSoQuyAsync` (Loại: THU hoặc CHI).
  - `XoaSoQuyAsync` (Hoàn tác THU hoặc CHI).
- [x] Chuẩn hóa các hàm tra cứu `LayThuChiNamAsync`, `LayThuChiKyAsync`, `LayThuChiThangAsync`, `LayThuChiTuanAsync` hỗ trợ lọc linh hoạt theo id hoặc lấy toàn bộ chi nhánh.
- [x] Đồng bộ các router Controller: `ChuDoanhNghiepTaiChinhController.cs`, `QuanLyTaiChinhController.cs`.

---

### ✅ Giai đoạn 8: Phụ huynh - Học sinh (Bảng trung gian & Quan hệ đa chiều) (HOÀN THÀNH)
- [x] `IHocSinhService.cs` & `HocSinhService.cs`:
  - Thêm phương thức `XoaQuanHePhuHuynhHocSinhByIdAsync(int idPhHs)`.
  - Cải tiến `TaoMoiPhuHuynhChoHocSinhAsync`: Tự động tìm kiếm CCCD phụ huynh trong CSDL, nếu đã tồn tại thì liên kết trực tiếp vào học sinh thay vì tạo bản ghi trùng lặp hoặc báo lỗi.
- [x] `ChuDoanhNghiepStudentController.cs`:
  - Thêm kiểm tra trùng số CCCD khi tạo mới phụ huynh (`TaoPhuHuynh`) và cập nhật phụ huynh (`CapNhatPhuHuynh`), trả về `409 Conflict`.
  - Bổ sung route `[HttpDelete("phu-huynh-hoc-sinh/{idPhHs}")]`.
  - Bổ sung các route alias chuẩn Java: `[HttpGet("hoc-sinh/{idHs}/phu-huynh-bang-phu")]`, `[HttpGet("phu-huynh/{idPh}/hoc-sinh-bang-phu")]`, `[HttpPost("phu-huynh-hoc-sinh")]`.
- [x] `HocSinhKhoaHocController.cs`: Ủy quyền hàm `XoaHocSinhKhoaHoc` sang `_hocSinhService.XoaHocSinhKhoiKhoaHocAsync` để cascade soft-delete bản ghi `DangKyHoc`.

---

### ✅ Giai đoạn 9: Nhân sự nâng cao & Import giáo viên hàng loạt (HOÀN THÀNH)
- [x] `NhanSuDtos.cs`: Định nghĩa `GiaoVienBulkDto` và `BulkResultDto`.
- [x] `INhanSuService.cs` & `NhanSuService.cs`:
  - Xây dựng `LuuGiaoVienHangLoatAsync(int idDn, List<GiaoVienBulkDto> danhSach)`:
    - Kiểm tra giới hạn tối đa 50 bản ghi/lần gửi.
    - Xác thực danh sách chi nhánh `idCn` gửi lên phải trực thuộc doanh nghiệp `idDn`.
    - Kiểm tra chống trùng SĐT nội bộ lô gửi lên và kiểm tra trùng với CSDL doanh nghiệp.
    - Kiểm tra định dạng CCCD 12 chữ số.
    - Bọc Transaction toàn bộ quá trình: Tạo `GiaoVien`, tạo `ChiTietGv` (trình độ, CCCD, địa chỉ), tạo `GiaoVienChiNhanh`.
    - Tự động cấp tài khoản đăng nhập với mật khẩu mã hóa BCrypt nếu được yêu cầu hoặc có SĐT.
    - Thống kê chi tiết `tongSo`, `thanhCong`, `thatBai`, và `danhSachLoi` theo từng dòng.
  - Bổ sung kiểm tra trùng số điện thoại giáo viên khi tạo mới đơn lẻ trong `LuuGiaoVienAsync` (báo 409 Conflict).
- [x] `ChuDoanhNghiepNhanSuController.cs`:
  - Mở các endpoints: `[HttpPost("doanh-nghiep/nhan-su/teachers/bulk")]`, `[HttpPost("doanh-nghiep/giao-vien/hang-loat")]`, `[HttpPost("doanh-nghiep/{idDn}/giao-vien/hang-loat")]`.

---

### ✅ Giai đoạn 10: Rà soát toàn diện API Endpoints & Mã lỗi chuẩn hóa (HOÀN THÀNH)
- [x] **Rà soát 31 REST Controllers**: Khớp 100% route giữa Java backend và .NET backend (Admin, Chủ doanh nghiệp, Giáo viên, Quản lý, Chung).
- [x] **Chuẩn hóa mã phản hồi lỗi `ApiResponse<T>`**:
  - Bổ sung trường `Code` định danh chuẩn: `THAM_SO_KHONG_HOP_LE` (400), `THIEU_XAC_THUC` (401), `TU_CHOI_TRUY_CAP` (403), `KHONG_TIM_THAY` (404), `DU_LIEU_XUNG_DOT` (409), `LOI_HE_THONG` (500).
- [x] **Xử lý toàn diện mã lỗi HTTP**:
  - `JwtBearerEvents` trong `Program.cs`: Bắt sự kiện `OnChallenge` (401) và `OnForbidden` (403) trả về JSON chuẩn xác, ngăn chặn lỗi trả về HTML/trang trắng.
  - `UseExceptionHandler` trong `Program.cs`: Bắt ngoại lệ chưa lường trước trả về 500 JSON bảo mật.
- [x] **Kiểm thử thực tế (End-to-End)**:
  - 401 Unauthorized: Trả về JSON chuẩn `{ success: false, code: "THIEU_XAC_THUC", statusCode: 401 }`.
  - 404 Not Found: Trả về JSON chuẩn `{ success: false, code: "KHONG_TIM_THAY", statusCode: 404 }`.
  - 409 Conflict: Trả về JSON chuẩn khi trùng CCCD hoặc trùng SĐT giáo viên.
  - 200/201 Success: Nhập giáo viên hàng loạt và gán phụ huynh hoạt động hoàn hảo.
- [x] **Biên dịch**: `dotnet build` đạt **0 Warning, 0 Error**.
