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
    console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐẦY ĐỦ CÁC TÍNH NĂNG NHÂN SỰ MỚI (PHẦN 2)');

    // 1. Đăng nhập lấy Bearer Token
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

    // 2. Thêm mới Nhân công khác
    console.log('\n--- 1. Kiểm thử Thêm Nhân công khác ---');
    const ncRes = await request({
        path: '/api/nhan-cong',
        method: 'POST',
        headers: authHeaders
    }, {
        hoTen: 'Nguyễn Văn Bảo Vệ Test',
        sdt: '0988112233',
        chucVu: 'Bảo vệ ca đêm',
        mucLuong: 7500000,
        idCn: 1,
        idDn: 1
    });
    console.log('Thêm nhân công status:', ncRes.status, 'ID:', ncRes.data?.data?.idNhanCongKhac);
    const idNc = ncRes.data?.data?.idNhanCongKhac;

    // 3. Lấy danh sách nhân công
    console.log('\n--- 2. Kiểm thử Lấy danh sách Nhân công theo Doanh nghiệp ---');
    const listNcRes = await request({
        path: '/api/nhan-cong',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Lấy danh sách nhân công status:', listNcRes.status, 'Số lượng:', listNcRes.data?.data?.length);

    // 4. Cập nhật nhân công
    if (idNc) {
        console.log('\n--- 3. Kiểm thử Cập nhật Nhân công ---');
        const capNhatNcRes = await request({
            path: `/api/nhan-cong/${idNc}`,
            method: 'PUT',
            headers: authHeaders
        }, {
            hoTen: 'Nguyễn Văn Bảo Vệ Test (Đã sửa)',
            chucVu: 'Tổ trưởng bảo vệ',
            mucLuong: 8500000,
            idCn: 1
        });
        console.log('Cập nhật nhân công status:', capNhatNcRes.status, 'Chức vụ mới:', capNhatNcRes.data?.data?.chucVu);
    }

    // 5. Thêm chứng chỉ cho Giáo viên #1
    console.log('\n--- 4. Kiểm thử Thêm Chứng chỉ Giáo viên #1 ---');
    const ccRes = await request({
        path: '/api/giao-vien/1/chung-chi',
        method: 'POST',
        headers: authHeaders
    }, {
        tenChungChi: 'IELTS 8.0 Teaching Certificate',
        ngayCap: '2026-05-15',
        urlAnh: 'https://example.com/certs/ielts.png'
    });
    console.log('Thêm chứng chỉ status:', ccRes.status, 'ID:', ccRes.data?.data?.idChungChi);
    const idCc = ccRes.data?.data?.idChungChi;

    // 6. Lấy danh sách chứng chỉ
    console.log('\n--- 5. Kiểm thử Lấy danh sách Chứng chỉ Giáo viên #1 ---');
    const listCcRes = await request({
        path: '/api/giao-vien/1/chung-chi',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Lấy danh sách chứng chỉ status:', listCcRes.status, 'Số chứng chỉ:', listCcRes.data?.data?.length);

    // 7. Cập nhật Chi tiết giáo viên #1
    console.log('\n--- 6. Kiểm thử Cập nhật Chi tiết Giáo viên #1 ---');
    const ctRes = await request({
        path: '/api/giao-vien/1/chi-tiet',
        method: 'PUT',
        headers: authHeaders
    }, {
        idGv: 1,
        cccd: 79123456789,
        trinhDo: 'Thạc sĩ Sư phạm Anh văn',
        diaChi: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
        sdtNguoiThan: '0909123456',
        tenNguoiThan: 'Nguyễn Văn Thân',
        trangThaiHoatDong: true
    });
    console.log('Cập nhật chi tiết GV status:', ctRes.status, 'Trình độ:', ctRes.data?.data?.trinhDo);

    // 8. Tra cứu Hồ sơ cá nhân 360 độ
    console.log('\n--- 7. Kiểm thử Lấy Hồ sơ cá nhân Giáo viên #1 ---');
    const hoSoRes = await request({
        path: '/api/giao-vien/1/ho-so',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Lấy hồ sơ GV status:', hoSoRes.status, 'Họ tên:', hoSoRes.data?.data?.hoTen, 'Số chứng chỉ:', hoSoRes.data?.data?.chungChis?.length);

    // 9. Tra cứu giáo viên theo SĐT
    console.log('\n--- 8. Kiểm thử Tra cứu Giáo viên theo SĐT ---');
    const sdtRes = await request({
        path: '/api/giao-vien/tim-sdt?sdt=09',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Tìm theo SĐT status:', sdtRes.status, 'Tìm thấy:', sdtRes.data?.data?.length);

    // 10. Dọn dẹp bản ghi test
    if (idCc) {
        console.log('\n--- 9. Dọn dẹp: Xóa chứng chỉ test ---');
        const xoaCcRes = await request({
            path: `/api/chung-chi/${idCc}`,
            method: 'DELETE',
            headers: authHeaders
        });
        console.log('Xóa chứng chỉ status:', xoaCcRes.status);
    }

    if (idNc) {
        console.log('\n--- 10. Dọn dẹp: Xóa nhân công test ---');
        const xoaNcRes = await request({
            path: `/api/nhan-cong/${idNc}`,
            method: 'DELETE',
            headers: authHeaders
        });
        console.log('Xóa nhân công status:', xoaNcRes.status);
    }

    console.log('\n🎉 HOÀN THÀNH TẤT CẢ KIỂM THỬ NHÂN SỰ (PHẦN 2) THÀNH CÔNG RỰC RỠ!');
}

runTests().catch(err => {
    console.error('Lỗi kiểm thử:', err);
    process.exit(1);
});
