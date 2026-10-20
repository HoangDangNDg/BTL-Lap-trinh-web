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
    console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐÀO TẠO, TKB, BUỔI HỌC & ĐIỂM DANH (PHẦN 4)');

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

    let passed = 0;
    let total = 0;

    function assert(desc, condition, details = '') {
        total++;
        if (condition) {
            passed++;
            console.log(`  ✔ [PASS] ${desc}`);
        } else {
            console.error(`  ❌ [FAIL] ${desc} - ${details}`);
        }
    }

    // Test 1: Lấy TKB tuần theo lớp
    const tkbRes = await request({
        path: '/api/quan-ly/thoi-khoa-bieu/tuan?idLop=1',
        method: 'GET',
        headers: authHeaders
    });
    assert('1. Lấy TKB tuần theo Lớp (#1)', tkbRes.status === 200 && Array.isArray(tkbRes.data.data), JSON.stringify(tkbRes.data));

    // Test 2: Lưu khung lịch cố định
    const fixedRes = await request({
        path: '/api/quan-ly/thoi-khoa-bieu/fixed?idLop=1&idPhong=1',
        method: 'POST',
        headers: authHeaders
    }, {
        thu: 3,
        caHoc: 2,
        gioBatDau: "08:00:00",
        gioKetThuc: "10:00:00"
    });
    assert('2. Lưu Khung lịch cố định Lớp #1, Phòng #1', fixedRes.status === 200 || fixedRes.status === 201, JSON.stringify(fixedRes.data));

    // Test 3: Lấy khung lịch cố định theo lớp
    const getFixedRes = await request({
        path: '/api/quan-ly/thoi-khoa-bieu/fixed?idLop=1',
        method: 'GET',
        headers: authHeaders
    });
    assert('3. Lấy Khung lịch cố định theo Lớp (#1)', getFixedRes.status === 200 && Array.isArray(getFixedRes.data.data), JSON.stringify(getFixedRes.data));

    // Test 4: Tự động sinh buổi học theo tuần
    const genRes = await request({
        path: '/api/quan-ly/thoi-khoa-bieu/classes/1/weeks/1/generate-sessions',
        method: 'POST',
        headers: authHeaders
    });
    assert('4. Tự động sinh buổi học theo Tuần (#1)', genRes.status === 200 && Array.isArray(genRes.data.data), JSON.stringify(genRes.data));

    // Test 5: Lấy danh sách buổi học theo lớp
    const sessionsRes = await request({
        path: '/api/quan-ly/thoi-khoa-bieu/sessions?idLop=1',
        method: 'GET',
        headers: authHeaders
    });
    assert('5. Lấy danh sách Buổi học theo Lớp (#1)', sessionsRes.status === 200 && Array.isArray(sessionsRes.data.data), JSON.stringify(sessionsRes.data));
    const firstSessionId = sessionsRes.data.data?.[0]?.idBuoiHoc || 1;

    // Test 6: Lấy danh sách đăng ký học theo lớp
    const enrollRes = await request({
        path: '/api/quan-ly/thoi-khoa-bieu/enrollments?idLop=1',
        method: 'GET',
        headers: authHeaders
    });
    assert('6. Lấy danh sách Đăng ký học theo Lớp (#1)', enrollRes.status === 200 && Array.isArray(enrollRes.data.data), JSON.stringify(enrollRes.data));

    // Test 7: Lưu điểm danh học sinh theo lô
    const ddHsRes = await request({
        path: '/api/quan-ly/diem-danh/students/batch',
        method: 'POST',
        headers: authHeaders
    }, {
        idBuoiHoc: firstSessionId,
        idKhoaHoc: 1,
        danhSach: [
            { idHs: 1, hoTen: "Học sinh 1", trangThai: "CO_MAT" }
        ]
    });
    assert('7. Lưu Điểm danh Học sinh theo lô (Batch)', ddHsRes.status === 200 || ddHsRes.status === 201, JSON.stringify(ddHsRes.data));

    // Test 8: Lấy danh sách điểm danh học sinh theo buổi học
    const getDdHsRes = await request({
        path: `/api/quan-ly/diem-danh/students?idBuoi=${firstSessionId}`,
        method: 'GET',
        headers: authHeaders
    });
    assert('8. Lấy danh sách Điểm danh Học sinh theo Buổi học', getDdHsRes.status === 200 && Array.isArray(getDdHsRes.data.data), JSON.stringify(getDdHsRes.data));

    // Test 9: Điểm danh giáo viên buổi học
    const ddGvRes = await request({
        path: `/api/quan-ly/diem-danh/teachers?idGv=1&idBuoi=${firstSessionId}`,
        method: 'POST',
        headers: authHeaders
    }, {
        trangThai: "CO_MAT"
    });
    assert('9. Điểm danh Giáo viên buổi học', ddGvRes.status === 200 || ddGvRes.status === 201, JSON.stringify(ddGvRes.data));

    // Test 10: Lấy lịch sử điểm danh giáo viên
    const getDdGvRes = await request({
        path: '/api/quan-ly/diem-danh/teachers?idGv=1',
        method: 'GET',
        headers: authHeaders
    });
    assert('10. Lấy Lịch sử điểm danh Giáo viên (#1)', getDdGvRes.status === 200 && Array.isArray(getDdGvRes.data.data), JSON.stringify(getDdGvRes.data));

    console.log(`\n🏁 KẾT QUẢ PHẦN 4: ${passed}/${total} TESTS PASS (${Math.round(passed / total * 100)}%)`);
    if (passed !== total) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Lỗi ngoại lệ:', err);
    process.exit(1);
});
