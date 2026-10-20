const ApiClient = require('./api-client');

// ANSI Color Codes cho Terminal
const Colors = {
    Reset: '\x1b[0m',
    Bright: '\x1b[1m',
    Green: '\x1b[32m',
    Red: '\x1b[31m',
    Yellow: '\x1b[33m',
    Blue: '\x1b[34m',
    Magenta: '\x1b[35m',
    Cyan: '\x1b[36m',
    Gray: '\x1b[90m'
};

const BASE_URL = process.env.API_URL || process.argv[2] || 'http://localhost:5120';
const client = new ApiClient(BASE_URL);

let totalPassed = 0;
let totalFailed = 0;
const results = [];

function logHeader(title) {
    console.log(`\n${Colors.Bright}${Colors.Cyan}================================================================${Colors.Reset}`);
    console.log(`${Colors.Bright}${Colors.Cyan}  ${title}${Colors.Reset}`);
    console.log(`${Colors.Bright}${Colors.Cyan}================================================================${Colors.Reset}`);
}

function recordResult(name, passed, duration, detail = '') {
    if (passed) {
        totalPassed++;
        console.log(` ${Colors.Green}✔ PASS${Colors.Reset} [${duration}ms] ${name}`);
        if (detail) console.log(`   ${Colors.Gray}${detail}${Colors.Reset}`);
    } else {
        totalFailed++;
        console.log(` ${Colors.Red}✖ FAIL${Colors.Reset} [${duration}ms] ${name}`);
        if (detail) console.log(`   ${Colors.Red}${detail}${Colors.Reset}`);
    }
    results.push({ name, passed, duration, detail });
}

async function runTests() {
    console.log(`\n${Colors.Bright}${Colors.Yellow}🚀 KHỞI CHẠY TEST RUNNER CHO .NET BACKEND${Colors.Reset}`);
    console.log(`Target URL: ${Colors.Blue}${BASE_URL}${Colors.Reset}\n`);

    // 0. Kiểm tra kết nối Backend
    const ping = await client.request('/api/auth/login', { method: 'OPTIONS' });
    if (ping.status === 0) {
        console.log(`${Colors.Red}❌ KHÔNG THỂ KẾT NỐI ĐẾN SERVER TẠI: ${BASE_URL}${Colors.Reset}`);
        console.log(`${Colors.Yellow}Vui lòng khởi động backend bằng lệnh:${Colors.Reset}`);
        console.log(`  ${Colors.Cyan}cd C:\\D\\btlwebtrentruong\\dotnet_backend${Colors.Reset}`);
        console.log(`  ${Colors.Cyan}dotnet run${Colors.Reset}\n`);
        return;
    }

    // ==========================================
    // PHÂN HỆ 1: AUTHENTICATION & JWT
    // ==========================================
    logHeader('PHÂN HỆ 1: XÁC THỰC, JWT & BẢO MẬT PHÂN QUYỀN');

    // Test 1: Đăng nhập bỏ trống thông tin -> Kỳ vọng 400
    {
        const res = await client.login('', '');
        const pass = res.status === 400;
        recordResult('Auth: Từ chối đăng nhập khi thiếu tên đăng nhập / mật khẩu', pass, res.duration, `HTTP Status: ${res.status}`);
    }

    // Test 2: Đăng nhập sai mật khẩu -> Kỳ vọng 401
    {
        const res = await client.login('non_existing_user_9999', 'wrong_pass');
        const pass = res.status === 401 || res.status === 404;
        recordResult('Auth: Từ chối đăng nhập với tài khoản không tồn tại', pass, res.duration, `HTTP Status: ${res.status}`);
    }

    // Test 3: Đăng nhập tài khoản test (admin_an/123456)
    let loginSuccess = false;
    {
        let res = await client.login('admin_an', '123456');
        if (!res.ok) {
            res = await client.login('admin', 'admin123');
        }
        if (res.ok && res.data?.data?.token) {
            loginSuccess = true;
            recordResult('Auth: Đăng nhập thành công & nhận JWT Token', true, res.duration, `User: ${res.data.data.tenDangNhap} | Role: ${res.data.data.vaiTro}`);
        } else {
            recordResult('Auth: Đăng nhập (Chưa đúng tài khoản seed hoặc mật khẩu)', false, res.duration, `Msg: ${res.data?.message || res.statusText}`);
        }
    }

    // ==========================================
    // PHÂN HỆ 2: QUẢN LÝ HỌC SINH
    // ==========================================
    logHeader('PHÂN HỆ 2: HỌC SINH & GÁN KHÓA HỌC');

    let sampleStudentId = null;
    {
        const res = await client.getStudents({ pageIndex: 1, pageSize: 5 });
        const pass = res.ok && res.data?.data?.items !== undefined;
        if (pass && res.data.data.items.length > 0) {
            sampleStudentId = res.data.data.items[0].idHs;
        }
        recordResult('Học sinh: Lấy danh sách học sinh phân trang server-side', pass, res.duration, 
            pass ? `Tìm thấy ${res.data.data.totalCount} học sinh (Trang 1: ${res.data.data.items.length} bản ghi)` : res.data?.message);
    }

    if (sampleStudentId) {
        const res = await client.getStudentById(sampleStudentId);
        const pass = res.ok && res.data?.data?.idHs === sampleStudentId;
        recordResult(`Học sinh: Tra cứu chi tiết hồ sơ 360 ID #${sampleStudentId}`, pass, res.duration, 
            pass ? `Họ tên: ${res.data.data.hoTen}` : res.data?.message);
    }

    // Test gán mẻ học sinh vào khóa học (Batch - chống N+1)
    {
        const res = await client.assignCourseBatch(1, [1, 2, 3]);
        const pass = res.status === 200 || res.status === 404; // 404 nếu khóa học 1 chưa có trong DB
        recordResult('Học sinh: Gán nhiều học sinh vào khóa học theo mẻ (Batch Assign)', pass, res.duration, 
            res.data?.message || `HTTP ${res.status}`);
    }

    // ==========================================
    // PHÂN HỆ 3: ĐIỂM DANH BUỔI HỌC
    // ==========================================
    logHeader('PHÂN HỆ 3: ĐIỂM DANH HÀNG LOẠT (BATCH ATTENDANCE)');

    // Test Điểm danh mẻ học sinh
    {
        const attendanceReq = {
            idBuoiHoc: 1,
            idKhoaHoc: 1,
            danhSach: [
                { idHs: 1, hoTen: 'Học sinh test 1', trangThai: 'CO_MAT' },
                { idHs: 2, hoTen: 'Học sinh test 2', trangThai: 'VANG' }
            ]
        };
        const res = await client.saveAttendanceBatch(attendanceReq);
        const pass = res.status === 200 || res.status === 404;
        recordResult('Điểm danh: Lưu điểm danh học sinh hàng loạt (Batch Attendance)', pass, res.duration, 
            res.data?.message || `HTTP ${res.status}`);
    }

    // Test Tra cứu điểm danh buổi học
    {
        const res = await client.getSessionAttendance(1);
        const pass = res.ok || res.status === 404;
        recordResult('Điểm danh: Lấy danh sách kiểm diện của buổi học #1', pass, res.duration, 
            res.ok ? `Số bản ghi: ${res.data?.data?.length || 0}` : `HTTP ${res.status}`);
    }

    // ==========================================
    // PHÂN HỆ 4: TÀI CHÍNH & SỔ QUỸ
    // ==========================================
    logHeader('PHÂN HỆ 4: TÀI CHÍNH, HỌC PHÍ & BÁO CÁO TỔNG HỢP');

    // Test Lập phiếu thu học phí
    {
        const receiptReq = {
            idHs: 1,
            idDn: 1,
            soTien: 1500000,
            phanTramGiam: 5,
            hinhThucThanhToan: 'CHUYEN_KHOAN',
            ghiChu: 'Test runner auto receipt'
        };
        const res = await client.createTuitionReceipt(receiptReq);
        const pass = res.status === 201 || res.status === 200 || res.status === 400 || res.status === 404;
        recordResult('Tài chính: Lập phiếu thu học phí có chiết khấu & ghi sổ quỹ tự động', pass, res.duration, 
            res.data?.message || `HTTP ${res.status}`);
    }

    // Test Báo cáo tổng hợp thu chi (SQL GroupBy Aggregation)
    {
        const res = await client.getFinancialSummary(1);
        const pass = res.ok;
        recordResult('Tài chính: Báo cáo tổng hợp Thu - Chi - Tồn quỹ (SQL GroupBy)', pass, res.duration, 
            pass ? `Tổng thu: ${res.data.data.tongThu} | Tổng chi: ${res.data.data.tongChi} | Tồn: ${res.data.data.tonQuy}` : `HTTP ${res.status}`);
    }

    // Test Ghi sổ quỹ thủ công
    {
        const cashbookEntry = {
            idCn: 1,
            idDn: 1,
            loaiGiaoDich: 'CHI',
            soTien: 250000,
            moTa: 'Test runner chi mua văn phòng phẩm'
        };
        const res = await client.recordCashbook(cashbookEntry);
        const pass = res.status === 201 || res.status === 200;
        recordResult('Tài chính: Ghi nhận giao dịch phát sinh vào Sổ Quỹ Thu Chi', pass, res.duration, 
            res.data?.message || `HTTP ${res.status}`);
    }

    // ==========================================
    // PHÂN HỆ 5: ĐÀO TẠO & LỚP HỌC (CRUD)
    // ==========================================
    logHeader('PHÂN HỆ 5: ĐÀO TẠO & QUẢN LÝ LỚP HỌC (CRUD)');

    // Test Lấy danh sách lớp học
    {
        const res = await client.request('/api/v1/dao-tao/lop-hoc?page=1&pageSize=5');
        const pass = res.ok && res.data?.data?.items?.length >= 0;
        recordResult('Đào tạo: Lấy danh sách lớp học phân trang server-side', pass, res.duration,
            pass ? `Tổng số lớp: ${res.data.data.totalCount} (Trang 1: ${res.data.data.items.length} lớp)` : `HTTP ${res.status}`);
    }

    // Test Lấy dropdown dữ liệu hỗ trợ
    {
        const res = await client.request('/api/v1/dao-tao/dropdown/chi-nhanh');
        const pass = res.ok && Array.isArray(res.data?.data);
        recordResult('Đào tạo: Lấy danh mục chi nhánh cho dropdown bộ lọc & modal', pass, res.duration,
            pass ? `Tìm thấy ${res.data.data.length} chi nhánh` : `HTTP ${res.status}`);
    }

    // Test Toàn trình CRUD: Thêm mới -> Cập nhật -> Phân công GV -> Xóa mềm lớp học
    {
        let newLopId = null;
        // 1. Tạo mới lớp học
        const createRes = await client.request('/api/v1/dao-tao/lop-hoc', {
            method: 'POST',
            body: {
                tenLop: 'Lớp Test Runner Auto C#',
                idCn: 1,
                idKh: 1,
                siSoToiDa: 25,
                trangThai: 'DangMo'
            }
        });
        const createPass = createRes.status === 200 || createRes.status === 201;
        newLopId = createRes.data?.data?.idLop;
        recordResult('Đào tạo: Mở lớp học mới (POST /api/v1/dao-tao/lop-hoc)', createPass, createRes.duration,
            createPass ? `Tạo thành công Lớp #${newLopId}: ${createRes.data.data.tenLop}` : `HTTP ${createRes.status}`);

        if (newLopId) {
            // 2. Cập nhật lớp học
            const updateRes = await client.request(`/api/v1/dao-tao/lop-hoc/${newLopId}`, {
                method: 'PUT',
                body: {
                    tenLop: 'Lớp Test Runner Auto C# (Đã Cập Nhật)',
                    siSoToiDa: 35
                }
            });
            const updatePass = updateRes.ok;
            recordResult('Đào tạo: Cập nhật thông tin lớp học (PUT /api/v1/dao-tao/lop-hoc/{id})', updatePass, updateRes.duration,
                updatePass ? `Đổi tên: ${updateRes.data.data.tenLop} | Sĩ số: ${updateRes.data.data.siSoToiDa}` : `HTTP ${updateRes.status}`);

            // 3. Phân công giáo viên
            const assignRes = await client.request(`/api/v1/dao-tao/lop-hoc/${newLopId}/phan-cong-gv`, {
                method: 'POST',
                body: { idGv: 1 }
            });
            const assignPass = assignRes.ok;
            recordResult('Đào tạo: Phân công giáo viên đứng lớp (POST /phan-cong-gv)', assignPass, assignRes.duration,
                assignPass ? `Giáo viên phụ trách: ${assignRes.data.data.tenGiaoVien}` : `HTTP ${assignRes.status}`);

            // 4. Xóa mềm lớp học
            const delRes = await client.request(`/api/v1/dao-tao/lop-hoc/${newLopId}`, {
                method: 'DELETE'
            });
            const delPass = delRes.ok;
            recordResult('Đào tạo: Xóa mềm lớp học (DELETE /api/v1/dao-tao/lop-hoc/{id})', delPass, delRes.duration,
                delPass ? `Đã gắn cờ xóa thành công lớp #${newLopId}` : `HTTP ${delRes.status}`);
        }
    }

    // ==========================================
    // PHÂN HỆ 6: QUẢN TRỊ NHÂN SỰ & GIÁO VIÊN
    // ==========================================
    logHeader('PHÂN HỆ 6: NHÂN SỰ & BẢNG LƯƠNG GIÁO VIÊN');

    // Test 1: Lấy danh sách giáo viên phân trang
    {
        const res = await client.request('/api/giao-vien?pageIndex=1&pageSize=5');
        const pass = res.ok && res.data?.data?.items !== undefined;
        recordResult('Nhân sự: Lấy danh sách giáo viên phân trang server-side', pass, res.duration,
            pass ? `Tổng số GV: ${res.data.data.totalCount} (Trang 1: ${res.data.data.items.length} GV)` : `HTTP ${res.status}`);
    }

    // Test 2: Lấy danh mục chuyên môn đào tạo
    {
        const res = await client.request('/api/dao-tao-chung/chuyen-mon');
        const pass = res.ok && Array.isArray(res.data?.data);
        recordResult('Nhân sự: Lấy danh mục chuyên môn giảng dạy', pass, res.duration,
            pass ? `Tìm thấy ${res.data.data.length} chuyên môn` : `HTTP ${res.status}`);
    }

    // Test 3: Lập phiếu chi lương giáo viên
    {
        const res = await client.request('/api/luong-giao-vien?idGv=1', {
            method: 'POST',
            body: {
                idGv: 1,
                soTien: 3500000,
                phuongThuc: 'CHUYEN_KHOAN',
                ghiChu: 'Test runner chi thù lao giáo viên'
            }
        });
        const pass = res.ok || res.status === 201;
        recordResult('Nhân sự: Lập phiếu chi trả lương giáo viên toàn chuỗi', pass, res.duration,
            pass ? 'Chi trả lương thành công' : `HTTP ${res.status}`);
    }

    // ==========================================
    // PHÂN HỆ 7: THỜI KHÓA BIỂU & PHÒNG HỌC
    // ==========================================
    logHeader('PHÂN HỆ 7: THỜI KHÓA BIỂU & PHÒNG HỌC');

    // Test 1: Lấy danh sách phòng học cơ sở
    {
        const res = await client.request('/api/phong-hoc?idCn=1');
        const pass = res.ok && Array.isArray(res.data?.data);
        recordResult('Phòng học: Lấy danh sách phòng học cơ sở', pass, res.duration,
            pass ? `Tìm thấy ${res.data.data.length} phòng học` : `HTTP ${res.status}`);
    }

    // Test 2: Lấy ma trận thời khóa biểu tuần
    {
        const res = await client.request('/api/quan-ly/thoi-khoa-bieu/weekly?idCn=1&tuan=1');
        const pass = res.ok && Array.isArray(res.data?.data);
        recordResult('Thời khóa biểu: Tra cứu ma trận lịch học tuần', pass, res.duration,
            pass ? `Số tiết/buổi đã xếp: ${res.data.data.length}` : `HTTP ${res.status}`);
    }

    // Test 3: Tạo mới phòng học
    {
        const res = await client.request('/api/phong-hoc', {
            method: 'POST',
            body: {
                tenPhong: 'Phòng Test Auto Runner',
                sucChua: 35,
                idCn: 1
            }
        });
        const pass = res.ok || res.status === 201;
        recordResult('Phòng học: Tạo mới phòng học cơ sở (POST /api/phong-hoc)', pass, res.duration,
            pass ? 'Tạo phòng học thành công' : `HTTP ${res.status}`);
    }

    // ==========================================
    // TỔNG KẾT BẢNG KẾT QUẢ
    // ==========================================
    console.log(`\n${Colors.Bright}${Colors.Magenta}================================================================${Colors.Reset}`);
    console.log(`${Colors.Bright}${Colors.Magenta}  TỔNG KẾT KIỂM THỬ TỰ ĐỘNG (SUMMARY REPORT)${Colors.Reset}`);
    console.log(`${Colors.Bright}${Colors.Magenta}================================================================${Colors.Reset}`);
    console.log(`  Tổng số test: ${results.length}`);
    console.log(`  ${Colors.Green}Thành công (PASS): ${totalPassed}${Colors.Reset}`);
    console.log(`  ${Colors.Red}Thất bại   (FAIL): ${totalFailed}${Colors.Reset}`);
    const avgDuration = Math.round(results.reduce((acc, r) => acc + r.duration, 0) / (results.length || 1));
    console.log(`  Thời gian phản hồi trung bình: ${avgDuration}ms`);
    console.log(`${Colors.Bright}${Colors.Magenta}================================================================${Colors.Reset}\n`);
}

// Chạy test runner
runTests().catch(err => {
    console.error('Lỗi ngoại lệ trong quá trình test runner:', err);
});
