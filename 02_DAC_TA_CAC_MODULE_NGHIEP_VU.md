# ĐẶC TẢ CÁC PHÂN HỆ NGHIỆP VỤ - TRUNG TÂM GIÁO DỤC (MYSQL SCHEMA V4)

> **Căn cứ nghiệp vụ**: Toàn bộ các phân hệ được xây dựng dựa trên cấu trúc Database thực tế đã có trong [`database.sql`](file:///c:/D/btlwebtrentruong/backend/src/main/resources/database.sql) và hệ thống Entity trong Backend Java [`backend/src/main/java/com/example/project/entity`](file:///c:/D/btlwebtrentruong/backend/src/main/java/com/example/project/entity).

---

## 1. TỔNG QUAN 8 PHÂN HỆ NGHIỆP VỤ TRUNG TÂM GIÁO DỤC

| Mã Module | Tên Phân Hệ | Các Bảng Cơ Sở Dữ Liệu MySQL Liên Quan | Vai Trò Chính | Nhóm Người Dùng Phụ Trách |
|:---:|:---|:---|:---|:---:|
| **MOD-01** | Doanh Nghiệp, Cổ Đông & Chi Nhánh | `doanh_nghiep`, `chu_co_dong`, `gop_von_so_huu`, `chi_nhanh`, `phong_hoc` | Quản trị tổ chức trung tâm, danh sách cổ đông, mạng lưới chi nhánh và phòng học. | Chủ doanh nghiệp, Admin |
| **MOD-02** | Quản Lý Giáo Viên & Nhân Sự | `giao_vien`, `chi_tiet_gv`, `chung_chi_giao_vien`, `chuyen_mon`, `giao_vien_chi_nhanh`, `giao_vien_chuyen_mon`, `quan_ly` | Hồ sơ giáo viên, chứng chỉ chuyên môn, chi nhánh công tác, thông tin hợp đồng. | Quản lý, Admin |
| **MOD-03** | Học Sinh, Phụ Huynh & Hồ Sơ 360° | `hoc_sinh`, `phu_huynh`, `phu_huynh_hoc_sinh`, `dang_ky_hoc`, `bao_luu_khoa_hoc` | Tiếp nhận học viên mới, thông tin phụ huynh liên hệ, lịch sử học tập, bảo lưu. | Quản lý, Tư vấn tuyển sinh |
| **MOD-04** | Đào Tạo, Khóa Học & Lớp Học | `nam_hoc`, `ky_hoc`, `thang_hoc`, `tuan_hoc`, `bo_mon`, `mon_hoc`, `khoa_hoc`, `lop_hoc`, `hoc_sinh_khoa_hoc` | Quản lý cây đào tạo: Năm học $\rightarrow$ Kỳ $\rightarrow$ Môn $\rightarrow$ Khóa học $\rightarrow$ Lớp học; gắn học sinh vào lớp. | Quản lý đào tạo, Giáo vụ |
| **MOD-05** | Thời Khóa Biểu & Buổi Học | `khung_lich_hoc_co_dinh`, `thoi_khoa_bieu_tuan`, `buoi_hoc` | Xếp lịch học tự động theo ca, xếp phòng học tránh xung đột, tạo buổi học chi tiết. | Giáo vụ, Quản lý |
| **MOD-06** | Nghiệp Vụ Điểm Danh & Chuyên Cần | `diem_danh_hoc_sinh`, `diem_danh_giao_vien` | Điểm danh học sinh từng buổi (có mặt, nghỉ có phép, vắng), chấm công giờ dạy giáo viên. | Giáo viên, Quản lý |
| **MOD-07** | Tài Chính, Thu Học Phí & Lương | `phieu_thu_hoc_phi`, `thanh_toan_hoc_phi_khoa_hoc_hoc_sinh`, `thanh_toan_giao_vien`, `so_quy_thu_chi`, `thu_chi_thang_hoc`, ... | Lập phiếu thu tiền học, tính lương giáo viên theo giờ/buổi, chốt sổ quỹ thu chi. | Kế toán, Quản lý, Admin |
| **MOD-08** | Tài Khoản, Phân Quyền & JWT | `tai_khoan`, `tai_khoan_admin`, `tai_khoan_ql`, `tai_khoan_gv`, `tai_khoan_ccd`, `refresh_token` | Đăng nhập hệ thống, cấp Access Token JWT, lưu Refresh Token Cookie, kiểm tra Role. | Toàn bộ người dùng |

---

## 2. CHI TIẾT NGHIỆP VỤ TỪNG PHÂN HỆ

---

### PHÂN HỆ 1: DOANH NGHIỆP, CHI NHÁNH & PHÒNG HỌC (MOD-01)
- **Mục tiêu**: Hỗ trợ mô hình chuỗi trung tâm giáo dục đa chi nhánh (Multi-Branch Education Center).
- **Nghiệp vụ cốt lõi**:
  1. Khai báo thông tin Doanh nghiệp/Trung tâm: Tên trung tâm, mã số thuế, ngày thành lập.
  2. Quản lý danh sách Chi nhánh (`chi_nhanh`): Mỗi chi nhánh gắn với 1 Doanh nghiệp (`id_dn`), có tên chi nhánh, địa chỉ, số điện thoại.
  3. Quản lý Phòng học (`phong_hoc`): Mỗi phòng học thuộc 1 chi nhánh, có sức chứa tối đa (số học sinh), tình trạng sử dụng.
  4. Quản lý Cổ đông & Góp vốn (`chu_co_dong`, `gop_von_so_huu`): Tỷ lệ sở hữu và số tiền góp vốn ban đầu.

---

### PHÂN HỆ 2: QUẢN LÝ GIÁO VIÊN & NHÂN SỰ (MOD-02)
- **Mục tiêu**: Quản lý toàn diện đội ngũ giảng viên cơ hữu và thỉnh giảng.
- **Nghiệp vụ cốt lõi**:
  1. Hồ sơ Giáo viên (`giao_vien`): Mã định danh, họ tên, ngày sinh, số điện thoại, email, CCCD.
  2. Thông tin chi tiết (`chi_tiet_gv`): Mức lương cơ bản, đơn giá mỗi buổi dạy, số tài khoản ngân hàng.
  3. Chứng chỉ & Chuyên môn (`chung_chi_giao_vien`, `chuyen_mon`): Lưu các bằng cấp giảng dạy (IELTS, bằng sư phạm, tin học...).
  4. Phân công Chi nhánh (`giao_vien_chi_nhanh`): Một giáo viên có thể dạy ở một hoặc nhiều chi nhánh của trung tâm.

---

### PHÂN HỆ 3: HỌC SINH, PHỤ HUYNH & HỒ SƠ 360° (MOD-03)
- **Mục tiêu**: Theo dõi toàn bộ vòng đời học viên từ lúc tư vấn, nhập học đến khi hoàn thành khóa.
- **Nghiệp vụ cốt lõi**:
  1. Hồ sơ Học sinh (`hoc_sinh`): Họ tên, ngày sinh, trường đang học, tình trạng học tập (*Đang học, Bảo lưu, Đã tốt nghiệp*).
  2. Mối quan hệ Phụ huynh (`phu_huynh`, `phu_huynh_hoc_sinh`): Lưu thông tin Cha/Mẹ, SĐT liên hệ khẩn cấp, người chịu trách nhiệm đóng học phí.
  3. Bảo lưu Khóa học (`bao_luu_khoa_hoc`): Tiếp nhận đơn xin bảo lưu, ghi nhận số buổi học còn lại và thời hạn bảo lưu.

---

### PHÂN HỆ 4: CHƯƠNG TRÌNH ĐÀO TẠO, KHÓA HỌC & LỚP HỌC (MOD-04)
- **Mục tiêu**: Tổ chức hệ thống giáo trình, khóa học và phân chia lớp học.
- **Cấu trúc phân cấp**:
  $$\text{Năm học} \longrightarrow \text{Kỳ học} \longrightarrow \text{Bộ môn / Môn học} \longrightarrow \text{Khóa học} \longrightarrow \text{Lớp học}$$
- **Nghiệp vụ cốt lõi**:
  1. Tạo Khóa học (`khoa_hoc`): Tổng số buổi học, học phí tiêu chuẩn của cả khóa, môn học phụ trách.
  2. Mở Lớp học (`lop_hoc`): Gắn với 1 Khóa học cụ thể, phân công Giáo viên chủ nhiệm/giảng dạy, chọn Phòng học và Chi nhánh.
  3. Gán Học sinh vào Lớp (`hoc_sinh_khoa_hoc`): Xếp học sinh vào lớp học, theo dõi ngày bắt đầu học.

---

### PHÂN HỆ 5: THỜI KHÓA BIỂU & BUỔI HỌC (MOD-05)
- **Mục tiêu**: Lên lịch học định kỳ và tự động sinh danh sách các buổi học trong tuần.
- **Nghiệp vụ cốt lõi**:
  1. Khung lịch học cố định (`khung_lich_hoc_co_dinh`): Ví dụ thứ 2-4-6 từ 18:00 đến 20:00 tại Phòng 101.
  2. Thời khóa biểu tuần (`thoi_khoa_bieu_tuan`): Lịch học cụ thể trong tuần học của lớp.
  3. Buổi học chi tiết (`buoi_hoc`): Mỗi buổi học vật lý có ngày diễn ra, giờ bắt đầu/kết thúc, nội dung bài học, trạng thái (*Chưa diễn ra, Đã hoàn thành, Bị hủy*).

---

### PHÂN HỆ 6: NGHIỆP VỤ ĐIỂM DANH & CHUYÊN CẦN (MOD-06)
- **Mục tiêu**: Đảm bảo theo dõi sĩ số từng buổi học và làm căn cứ tính công/lương.
- **Nghiệp vụ cốt lõi**:
  1. Điểm danh Học sinh (`diem_danh_hoc_sinh`): Ghi nhận từng học sinh trong buổi học: *Có mặt, Có phép, Vắng không phép*. Kèm ghi chú đánh giá thái độ học tập.
  2. Điểm danh Giáo viên (`diem_danh_giao_vien`): Chấm công giáo viên có mặt đúng giờ, số giờ giảng dạy thực tế.

---

### PHÂN HỆ 7: TÀI CHÍNH, HỌC PHÍ & SỔ QUỸ (MOD-07)
- **Mục tiêu**: Kiểm soát dòng tiền ra vào của trung tâm, minh bạch và chính xác.
- **Nghiệp vụ cốt lõi**:
  1. Lập Phiếu Thu Học Phí (`phieu_thu_hoc_phi`): Thu tiền học của học sinh, hỗ trợ các hình thức (Tiền mặt, Chuyển khoản ngân hàng, Quẹt thẻ). In phiếu thu cho phụ huynh.
  2. Thanh toán Lương Giáo viên (`thanh_toan_giao_vien`): Tính tổng số buổi dạy trong tháng x đơn giá buổi, sinh phiếu chi lương.
  3. Sổ Quỹ Thu Chi (`so_quy_thu_chi`): Tổng hợp toàn bộ dòng tiền Thu - Chi theo ngày/tuần/tháng/kỳ/năm học.

---

### PHÂN HỆ 8: TÀI KHOẢN, PHÂN QUYỀN & BẢO MẬT JWT (MOD-08)
- **Mục tiêu**: Quản trị tài khoản và xác thực truy cập bằng JWT Token.
- **Các vai trò trong hệ thống**:
  - `ROLE_ADMIN`: Toàn quyền cấu hình trung tâm, xem báo cáo tài chính toàn chuỗi.
  - `ROLE_CHU_DOANH_NGHIEP`: Xem báo cáo doanh thu, sổ quỹ cổ đông.
  - `ROLE_QUAN_LY`: Quản lý vận hành chi nhánh (Học sinh, lớp học, phòng học, điểm danh, thu học phí).
  - `ROLE_GIAO_VIEN`: Xem lịch dạy cá nhân, điểm danh học sinh lớp mình phụ trách.
