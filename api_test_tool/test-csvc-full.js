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
    console.log('🧪 BẮT ĐẦU KIỂM THỬ CƠ SỞ VẬT CHẤT & TÌM KIẾM NHANH (PHẦN 5)');

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

    // Test 1: Đổi trạng thái hoàn thành năm học
    const toggleNhRes = await request({
        path: '/api/dao-tao/nam-hoc/1/doi-trang-thai',
        method: 'PUT',
        headers: authHeaders
    });
    assert('1. Đổi trạng thái hoàn thành Năm học (#1)', toggleNhRes.status === 200, JSON.stringify(toggleNhRes.data));

    // Test 2: Tìm tuần học theo ngày
    const tuanNgayRes = await request({
        path: '/api/dao-tao/tuan-hoc/theo-ngay?ngay=2026-09-15',
        method: 'GET',
        headers: authHeaders
    });
    assert('2. Tìm Tuần học theo Ngày (2026-09-15)', tuanNgayRes.status === 200 || tuanNgayRes.status === 404, JSON.stringify(tuanNgayRes.data));

    // Test 3: Tìm kiếm nhanh tất cả theo SĐT
    const searchSdtRes = await request({
        path: '/api/tim-kiem/tat-ca/sdt?sdt=09',
        method: 'GET',
        headers: authHeaders
    });
    assert('3. Tìm kiếm nhanh đa năng theo SĐT (09...)', searchSdtRes.status === 200 && Array.isArray(searchSdtRes.data.data), JSON.stringify(searchSdtRes.data));

    // Test 4: Tìm kiếm nhanh tất cả theo CCCD
    const searchCccdRes = await request({
        path: '/api/tim-kiem/tat-ca/cccd?cccd=0',
        method: 'GET',
        headers: authHeaders
    });
    assert('4. Tìm kiếm nhanh đa năng theo CCCD (0...)', searchCccdRes.status === 200 && Array.isArray(searchCccdRes.data.data), JSON.stringify(searchCccdRes.data));

    // Test 5: Tìm kiếm nhanh Giáo viên theo SĐT
    const searchGvRes = await request({
        path: '/api/tim-kiem/giao-vien/sdt?sdt=09',
        method: 'GET',
        headers: authHeaders
    });
    assert('5. Tìm kiếm nhanh Giáo viên theo SĐT', searchGvRes.status === 200 && Array.isArray(searchGvRes.data.data), JSON.stringify(searchGvRes.data));

    // Test 6: Tìm kiếm nhanh Quản lý theo SĐT
    const searchQlRes = await request({
        path: '/api/tim-kiem/quan-ly/sdt?sdt=09',
        method: 'GET',
        headers: authHeaders
    });
    assert('6. Tìm kiếm nhanh Quản lý theo SĐT', searchQlRes.status === 200 && Array.isArray(searchQlRes.data.data), JSON.stringify(searchQlRes.data));

    // Test 7: Tìm kiếm nhanh Học sinh theo SĐT
    const searchHsRes = await request({
        path: '/api/tim-kiem/hoc-sinh/sdt?sdt=09',
        method: 'GET',
        headers: authHeaders
    });
    assert('7. Tìm kiếm nhanh Học sinh theo SĐT', searchHsRes.status === 200 && Array.isArray(searchHsRes.data.data), JSON.stringify(searchHsRes.data));

    console.log(`\n🏁 KẾT QUẢ PHẦN 5: ${passed}/${total} TESTS PASS (${Math.round(passed / total * 100)}%)`);
    if (passed !== total) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Lỗi ngoại lệ:', err);
    process.exit(1);
});
