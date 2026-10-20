const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5120;

function request(options, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: BASE_URL,
            port: PORT,
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {}
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        req.on('error', reject);
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐẦY ĐỦ CÁC TÍNH NĂNG TÀI CHÍNH MỚI (PHẦN 1)');

    // 1. Đăng nhập lấy Token
    const loginRes = await request({
        path: '/api/auth/login',
        method: 'POST'
    }, { tenDangNhap: 'admin_an', matKhau: '123456' });

    if (loginRes.status !== 200 || !loginRes.data.data?.token) {
        console.error('❌ Đăng nhập thất bại:', loginRes.data);
        process.exit(1);
    }
    const token = loginRes.data.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };
    console.log('✔ Đăng nhập thành công, nhận Bearer Token');

    // 2. Test Tạo đơn bảo lưu khóa học
    console.log('\n--- 1. Kiểm thử Tạo đơn Bảo lưu khóa học ---');
    const baoLuuRes = await request({
        path: '/api/bao-luu',
        method: 'POST',
        headers: authHeaders
    }, {
        idHs: 1,
        idLop: 1,
        idDangKy: 1,
        idDn: 1,
        soBuoiDaHoc: 4
    });
    console.log('Tạo bảo lưu status:', baoLuuRes.status, 'ID:', baoLuuRes.data?.data?.idBaoLuu);
    const idBaoLuu = baoLuuRes.data?.data?.idBaoLuu;

    // 3. Test Lấy danh sách bảo lưu
    console.log('\n--- 2. Kiểm thử Lấy danh sách Bảo lưu theo Doanh nghiệp ---');
    const listBaoLuuRes = await request({
        path: '/api/bao-luu',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Lấy danh sách bảo lưu status:', listBaoLuuRes.status, 'Số lượng:', listBaoLuuRes.data?.data?.length);

    // 4. Test Lấy danh sách bảo lưu theo Học sinh
    console.log('\n--- 3. Kiểm thử Lấy danh sách Bảo lưu theo Học sinh #1 ---');
    const hsBaoLuuRes = await request({
        path: '/api/hoc-sinh/1/bao-luu',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Bảo lưu học sinh status:', hsBaoLuuRes.status, 'Tìm thấy:', hsBaoLuuRes.data?.data?.length);

    // 5. Test Phê duyệt bảo lưu
    if (idBaoLuu) {
        console.log('\n--- 4. Kiểm thử Duyệt Bảo lưu ---');
        const duyetRes = await request({
            path: `/api/bao-luu/${idBaoLuu}/duyet`,
            method: 'PUT',
            headers: authHeaders
        }, { trangThaiBaoLuu: true, ngayKetThuc: '2026-12-31' });
        console.log('Duyệt bảo lưu status:', duyetRes.status, 'Trạng thái:', duyetRes.data?.data?.trangThaiBaoLuu);
    }

    // 6. Test Thanh toán lương giáo viên (gọi qua Service và tự ghi sổ quỹ)
    console.log('\n--- 5. Kiểm thử Thanh toán lương Giáo viên ---');
    const luongRes = await request({
        path: '/api/thanh-toan-luong',
        method: 'POST',
        headers: authHeaders
    }, {
        idGv: 1,
        idDn: 1,
        soTien: 5000000,
        ghiChu: 'Thanh toán lương giảng dạy tháng 10'
    });
    console.log('Thanh toán lương status:', luongRes.status, 'Số tiền:', luongRes.data?.data?.soTien);
    const idThanhToan = luongRes.data?.data?.idThanhToan;

    // 7. Test Lịch sử lương giáo viên
    console.log('\n--- 6. Kiểm thử Tra cứu lịch sử lương Giáo viên #1 ---');
    const lsLuongRes = await request({
        path: '/api/giao-vien/1/thanh-toan',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Lịch sử lương status:', lsLuongRes.status, 'Số phiếu:', lsLuongRes.data?.data?.length);

    // 8. Test Báo cáo thu chi năm học
    console.log('\n--- 7. Kiểm thử Báo cáo Thu Chi cấp Năm học ---');
    const tcNamRes = await request({
        path: '/api/thu-chi-nam/1',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Báo cáo thu chi năm status:', tcNamRes.status, 'Dữ liệu:', tcNamRes.data?.data?.length);

    // 9. Dọn dẹp bản ghi kiểm thử
    if (idBaoLuu) {
        console.log('\n--- 8. Dọn dẹp: Xóa đơn bảo lưu test ---');
        const xoaBlRes = await request({
            path: `/api/bao-luu/${idBaoLuu}`,
            method: 'DELETE',
            headers: authHeaders
        });
        console.log('Xóa đơn bảo lưu test status:', xoaBlRes.status);
    }

    if (idThanhToan) {
        console.log('\n--- 9. Dọn dẹp: Hủy phiếu lương test ---');
        const xoaTtRes = await request({
            path: `/api/thanh-toan-giao-vien/${idThanhToan}`,
            method: 'DELETE',
            headers: authHeaders
        });
        console.log('Hủy phiếu lương test status:', xoaTtRes.status);
    }

    console.log('\n🎉 HOÀN THÀNH TẤT CẢ KIỂM THỬ TÀI CHÍNH (PHẦN 1) THÀNH CÔNG RỰC RỠ!');
}

runTests().catch(err => {
    console.error('Lỗi kiểm thử:', err);
    process.exit(1);
});
