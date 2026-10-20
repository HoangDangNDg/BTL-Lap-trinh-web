# HƯỚNG DẪN THIẾT KẾ FRONTEND HTML, BOOTSTRAP VÀ UI/UX - QUẢN LÝ TRUNG TÂM GIÁO DỤC

> **Mục tiêu**: Xây dựng giao diện Front-end hiện đại, dễ thao tác cho các nghiệp vụ đặc thù của **Trung tâm Giáo dục**: Xem thời khóa biểu, điểm danh nhanh, lập phiếu thu học phí và tra cứu hồ sơ học viên 360°, đáp ứng đầy đủ tiêu chí của đề cương BTL: **Responsive, Giao tiếp RESTful API / JWT và tương tác AJAX không reload**.

---

## 1. CẤU TRÚC LAYOUT TỔNG THỂ (DASHBOARD MASTER LAYOUT)

Bố cục giao diện dành cho ban quản lý và giáo viên:

```text
+-----------------------------------------------------------------------------------------+
| [LOGO TRUNG TÂM] | [Dropdown: Chọn Chi nhánh Cầu Giấy ▼]   [🔔 Thông báo] [👤 Quản Lý] |
+------------------+----------------------------------------------------------------------+
| [SIDEBAR NỘI BỘ] | BREADCRUMB: Trang chủ > Đào tạo > Danh sách lớp học đang diễn ra      |
|                  |----------------------------------------------------------------------|
| 📊 Tổng quan     | [METRIC CARDS: Tổng học viên: 1.250 | Lớp đang mở: 34 | Thu phí hôm nay]|
| 👨‍🎓 Hồ sơ Học sinh|----------------------------------------------------------------------|
| 👨‍🏫 Giáo viên     | [BỘ LỌC TÌM KIẾM: Khóa học, Ca học, Phòng học, Nút Mở Lớp Mới]        |
| 📚 Khóa học & Lớp|----------------------------------------------------------------------|
| 🗓️ Thời khóa biểu| [BẢNG DANH SÁCH LỚP HỌC (AJAX Table)]                                 |
| ✅ Điểm danh      | - Cột: Mã lớp, Tên môn, Giáo viên, Phòng, Sĩ số, Ca học, Thao tác   |
| 💵 Thu chi học phí|----------------------------------------------------------------------|
| 📈 Báo cáo       | [THANH PHÂN TRANG: « Trang 1 2 3 ... 8 »]                            |
+------------------+----------------------------------------------------------------------+
|             © 2026 Hệ Thống Quản Lý Trung Tâm Giáo Dục - Đề tài BTL Lập Trình Web       |
+-----------------------------------------------------------------------------------------+
```

---

## 2. THIẾT KẾ MÀN HÌNH ĐẶC THÙ NGÀNH GIÁO DỤC

### 2.1. Bảng Điểm Danh Nhanh Theo Buổi Học (Attendance Grid)
Giao diện giúp giáo viên hoặc trợ giảng điểm danh nhanh toàn bộ học sinh trong 1 buổi học chỉ bằng vài click:

```html
<div class="card shadow-sm border-0 mb-4">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-primary fw-bold">
            <i class="fa-solid fa-clipboard-check me-2"></i> Điểm danh Buổi học: 18/10/2026 - Lớp: IELTS Intensive
        </h5>
        <div>
            <button class="btn btn-sm btn-outline-success me-2" onclick="tickAllPresent()">
                <i class="fa-solid fa-check-double"></i> Chọn tất cả có mặt
            </button>
            <button class="btn btn-sm btn-primary" onclick="saveAttendance()">
                <i class="fa-solid fa-floppy-disk"></i> Lưu điểm danh
            </button>
        </div>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th style="width: 50px;">STT</th>
                        <th>Mã HV</th>
                        <th>Họ và Tên</th>
                        <th>Số Điện Thoại</th>
                        <th class="text-center">Trạng Thái</th>
                        <th>Ghi Chú Đánh Giá</th>
                    </tr>
                </thead>
                <tbody id="attendanceTableBody">
                    <!-- Dynamic rendering qua jQuery AJAX -->
                    <tr>
                        <td>1</td>
                        <td><strong>HV0105</strong></td>
                        <td>Nguyễn Văn An</td>
                        <td>0912345678</td>
                        <td class="text-center">
                            <div class="btn-group" role="group">
                                <input type="radio" class="btn-check" name="status_105" id="present_105" value="CO_MAT" checked>
                                <label class="btn btn-outline-success btn-sm" for="present_105">Có mặt</label>

                                <input type="radio" class="btn-check" name="status_105" id="excused_105" value="CO_PHEP">
                                <label class="btn btn-outline-warning btn-sm" for="excused_105">Có phép</label>

                                <input type="radio" class="btn-check" name="status_105" id="absent_105" value="VANG">
                                <label class="btn btn-outline-danger btn-sm" for="absent_105">Vắng</label>
                            </div>
                        </td>
                        <td><input type="text" class="form-control form-control-sm" placeholder="Nhận xét bài tập..."></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
```

### 2.2. Modal Lập Phiếu Thu Học Phí (Tuition Receipt Modal)
Tự động tính toán tổng số tiền cần thanh toán dựa vào khóa học và giảm giá:
```html
<div class="modal fade" id="modalThuHocPhi" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title"><i class="fa-solid fa-receipt me-2"></i> Lập Phiếu Thu Học Phí</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="formThuHocPhi">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Học sinh:</label>
                            <input type="text" class="form-control" id="tenHocSinh" readonly>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Khóa học đăng ký:</label>
                            <input type="text" class="form-control" id="tenKhoaHoc" readonly>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Số tiền học phí gốc (VND):</label>
                            <input type="text" class="form-control fw-bold text-primary" id="hocPhiGoc" readonly>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Miễn giảm / Học bổng (%):</label>
                            <input type="number" class="form-control" id="phanTramGiam" min="0" max="100" value="0">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Hình thức thanh toán:</label>
                            <select class="form-select" id="hinhThucThanhToan">
                                <option value="TIEN_MAT">Tiền mặt</option>
                                <option value="CHUYEN_KHOAN">Chuyển khoản (QR Code)</option>
                                <option value="QUET_THE">Quẹt thẻ POS</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Thực thu (VND):</label>
                            <input type="text" class="form-control fw-bold text-success fs-5" id="thucThu" readonly>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                <button type="button" class="btn btn-success" onclick="xacNhanThuTien()">
                    <i class="fa-solid fa-print me-1"></i> Xác Nhận & In Phiếu Thu
                </button>
            </div>
        </div>
    </div>
</div>
```

---

## 3. QUY ƯỚC NHÃN TRẠNG THÁI (STATUS BADGES)

- **Trạng thái Học viên**:
  + `<span class="badge bg-success">Đang học</span>`
  + `<span class="badge bg-warning text-dark">Bảo lưu</span>`
  + `<span class="badge bg-secondary">Đã hoàn thành</span>`
  + `<span class="badge bg-danger">Đã thôi học</span>`
- **Trạng thái Buổi học**:
  + `<span class="badge bg-info text-dark">Sắp diễn ra</span>`
  + `<span class="badge bg-success">Đã hoàn thành</span>`
  + `<span class="badge bg-danger">Bị hủy / Nghỉ lễ</span>`
- **Trạng thái Học phí**:
  + `<span class="badge bg-success">Đã hoàn thành</span>`
  + `<span class="badge bg-warning text-dark">Còn nợ đợt 2</span>`
  + `<span class="badge bg-danger">Chưa nộp</span>`
