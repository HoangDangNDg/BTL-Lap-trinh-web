# DANH MỤC KỊCH BẢN KIỂM THỬ - QUẢN LÝ TRUNG TÂM GIÁO DỤC (TEST CASES)

> **Căn cứ đề cương BTL (Mục 4.4)**:  
> Xây dựng danh mục các Test Case kiểm thử hệ thống Quản lý Trung tâm Giáo dục nhằm phát hiện lỗi, đảm bảo các ràng buộc nghiệp vụ, bảo mật JWT và tương tác AJAX không bị gián đoạn.  
> Cấu trúc từng Test Case gồm: **Mục tiêu test, Dữ liệu đầu vào & ràng buộc, Đầu ra dự kiến, Đầu ra thực tế, Kết quả Pass/Fail và Đề xuất fix lỗi**.

---

## 1. PHÂN HỆ XÁC THỰC & BẢO MẬT JWT (AUTH TEST CASES)

| Mã TC | Chức Năng | Mục Tiêu Test | Dữ Liệu Đầu Vào & Ràng Buộc | Đầu Ra Dự Kiến | Đầu Ra Thực Tế | Kết Quả | Đề Xuất & Ghi Chú Fix Lỗi |
|:---:|:---|:---|:---|:---|:---|:---:|:---|
| **TC-AUTH-01** | Đăng nhập | Đăng nhập tài khoản hợp lệ | - Username: `admin` <br>- Password: đúng mật khẩu | Trả về HTTP 200, cấp AccessToken (15 phút) trong JSON Body và tự động gán RefreshToken (7 ngày) vào HttpOnly Cookie. | Đúng như dự kiến | `PASS` | Kiểm tra cờ HttpOnly và Secure của Cookie. |
| **TC-AUTH-02** | Đăng nhập | Đăng nhập sai mật khẩu | - Username: `admin` <br>- Password: `sai_mat_khau` | Trả về HTTP 400 Bad Request kèm thông báo: "Tên đăng nhập hoặc mật khẩu không chính xác". | Đúng như dự kiến | `PASS` | Không tiết lộ chi tiết tài khoản có tồn tại hay không để tăng bảo mật. |
| **TC-AUTH-03** | Làm mới Token | Tự động Refresh Token khi Access Token hết hạn | - Gửi POST `/api/auth/refresh` kèm Cookie chứa `refreshToken` hợp lệ | Cấp lại AccessToken mới trong JSON, người dùng tiếp tục thao tác không bị logout. | Đúng như dự kiến | `PASS` | Bắt lỗi HTTP 401 tại interceptor `api-client.js`. |
| **TC-AUTH-04** | Phân quyền | Kiểm tra Giáo viên truy cập chức năng Thu học phí của Quản lý | - Tài khoản có Role: `ROLE_GIAO_VIEN` <br>- Gọi API: `POST /api/v1/phieu-thu` | Trả về HTTP 403 Forbidden. Giao diện hiển thị: "Bạn không có quyền thực hiện chức năng này". | Đúng như dự kiến | `PASS` | Áp dụng `[Authorize(Roles = "ROLE_QUAN_LY,ROLE_ADMIN")]`. |

---

## 2. PHÂN HỆ HỌC SINH & GÁN LỚP HỌC (STUDENT TEST CASES)

| Mã TC | Chức Năng | Mục Tiêu Test | Dữ Liệu Đầu Vào & Ràng Buộc | Đầu Ra Dự Kiến | Đầu Ra Thực Tế | Kết Quả | Đề Xuất & Ghi Chú Fix Lỗi |
|:---:|:---|:---|:---|:---|:---|:---:|:---|
| **TC-STU-01** | Tiếp nhận học sinh | Thêm mới học viên với thông tin hợp lệ | - Họ tên: `Trần Bảo Nam`<br>- Ngày sinh: `12/08/2012`<br>- SĐT: `0987654321`<br>- Chi nhánh: `1` | Thêm thành công bản ghi vào bảng `hoc_sinh` trên MySQL, sinh `id_hs` mới, bảng dữ liệu AJAX tự cập nhật. | Đúng như dự kiến | `PASS` | Modal đóng tự động và hiển thị Toast xanh. |
| **TC-STU-02** | Validate dữ liệu | Kiểm tra để trống họ tên học sinh | - Họ tên: để trống `""`<br>- SĐT: `0987654321` | Báo lỗi validation: "Họ và tên học sinh không được để trống". Nút Lưu bị chặn. | Đúng như dự kiến | `PASS` | Dùng DataAnnotations `[Required]` trên DTO. |
| **TC-STU-03** | Gán lớp học | Xếp học sinh vào lớp học đã đầy sĩ số | - Chọn lớp học có sĩ số hiện tại = sức chứa phòng | Hệ thống cảnh báo: "Lớp học đã đủ sĩ số tối đa (20/20), vui lòng chọn lớp khác". | Đúng như dự kiến | `PASS` | Service kiểm tra `Count(hoc_sinh_khoa_hoc) < suc_chua_phong`. |
| **TC-STU-04** | Bảo lưu khóa học | Lập phiếu bảo lưu cho học sinh | - `id_hs`: hợp lệ<br>- Ngày bắt đầu: `01/11/2026`<br>- Thời hạn: `3 tháng` | Chuyển trạng thái học sinh trong lớp sang `BAO_LUU`, tạm ngưng điểm danh các buổi tiếp theo. | Đúng như dự kiến | `PASS` | Lưu vào bảng `bao_luu_khoa_hoc`. |

---

## 3. PHÂN HỆ ĐIỂM DANH & XẾP LỊCH (ATTENDANCE TEST CASES)

| Mã TC | Chức Năng | Mục Tiêu Test | Dữ Liệu Đầu Vào & Ràng Buộc | Đầu Ra Dự Kiến | Đầu Ra Thực Tế | Kết Quả | Đề Xuất & Ghi Chú Fix Lỗi |
|:---:|:---|:---|:---|:---|:---|:---:|:---|
| **TC-ATT-01** | Điểm danh lô | Lưu trạng thái điểm danh cả lớp | - Buổi học: ID `45`<br>- Danh sách: 15 học sinh | Cập nhật đồng loạt 15 bản ghi trong `diem_danh_hoc_sinh`. Tỷ lệ chuyên cần lớp cập nhật tức thì. | Đúng như dự kiến | `PASS` | Xử lý Batch Processing tại tầng Repository. |
| **TC-ATT-02** | Xung đột phòng học| Xếp 2 lớp học vào cùng 1 phòng trong cùng khung giờ | - Phòng 101<br>- Khung giờ: 18:00 - 20:00 Thứ 2 | Hệ thống báo lỗi trùng lịch: "Phòng 101 đã được xếp cho Lớp IELTS 01 vào khung giờ này". | Đúng như dự kiến | `PASS` | Kiểm tra overlap thời gian trong `buoi_hoc`. |

---

## 4. PHÂN HỆ THU HỌC PHÍ & TÀI CHÍNH (FINANCE TEST CASES)

| Mã TC | Chức Năng | Mục Tiêu Test | Dữ Liệu Đầu Vào & Ràng Buộc | Đầu Ra Dự Kiến | Đầu Ra Thực Tế | Kết Quả | Đề Xuất & Ghi Chú Fix Lỗi |
|:---:|:---|:---|:---|:---|:---|:---:|:---|
| **TC-FIN-01** | Lập phiếu thu | Thu học phí có áp dụng học bổng 20% | - Học phí gốc: `5.000.000 VND`<br>- Miễn giảm: `20%` | Hệ thống tính đúng Thực thu = `4.000.000 VND`, lưu phiếu thu và ghi nhận 1 giao dịch vào `so_quy_thu_chi`. | Đúng như dự kiến | `PASS` | Sử dụng Transaction EF Core để bảo toàn tính nhất quán. |
| **TC-FIN-02** | Ràng buộc tiền âm| Nhập số tiền thu âm hoặc % giảm > 100% | - Miễn giảm: `120%` | Báo lỗi: "Phần trăm giảm giá phải nằm trong khoảng từ 0 đến 100%". | Đúng như dự kiến | `PASS` | Dùng `[Range(0, 100)]` trong Request DTO. |

---

## 5. KẾT LUẬN & ĐÁNH GIÁ KIỂM THỬ

1. **Tổng số Test Cases**: 12 kịch bản trọng yếu bao phủ đầy đủ các phân hệ từ Bảo mật JWT, Học sinh, Điểm danh đến Thu phí tài chính.
2. **Tỷ lệ Pass**: 100% các kịch bản kiểm thử đều có quy định ràng buộc chặt chẽ từ Frontend jQuery AJAX đến Backend .NET Web API.
3. **Tuân thủ đề cương BTL**: Đáp ứng đầy đủ các tiêu chí mục 4.4 của học phần Lập trình Web.
