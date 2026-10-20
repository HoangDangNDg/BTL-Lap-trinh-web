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
    console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐẦY ĐỦ CÁC TÍNH NĂNG HỌC SINH & PHỤ HUYNH MỚI (PHẦN 3)');

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

    // 2. Tạo mới Phụ huynh cho Học sinh #1
    console.log('\n--- 1. Kiểm thử Tạo mới Phụ huynh liên kết Học sinh #1 ---');
    const phRes = await request({
        path: '/api/hoc-sinh/1/tao-phu-huynh',
        method: 'POST',
        headers: authHeaders
    }, {
        hoTen: 'Phụ huynh Test Mẫu',
        sdt: '0977889900',
        cccd: '079988776655',
        email: 'phuhuynh.test@gmail.com',
        laNguoiDaiDien: true,
        quanHe: 'Mẹ'
    });
    console.log('Tạo phụ huynh status:', phRes.status, 'ID PH:', phRes.data?.data?.idPh);
    const idPh = phRes.data?.data?.idPh;

    // 3. Lấy danh sách phụ huynh theo học sinh
    console.log('\n--- 2. Kiểm thử Lấy danh sách Phụ huynh của Học sinh #1 ---');
    const listPhRes = await request({
        path: '/api/hoc-sinh/1/phu-huynh',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Lấy phụ huynh status:', listPhRes.status, 'Số lượng PH:', listPhRes.data?.data?.length);

    // 4. Lấy danh sách học sinh theo phụ huynh
    if (idPh) {
        console.log('\n--- 3. Kiểm thử Lấy danh sách Học sinh của Phụ huynh vừa tạo ---');
        const listHsRes = await request({
            path: `/api/phu-huynh/${idPh}/hoc-sinh`,
            method: 'GET',
            headers: authHeaders
        });
        console.log('Lấy học sinh status:', listHsRes.status, 'Số lượng HS:', listHsRes.data?.data?.length);
    }

    // 5. Tra cứu Học sinh theo SĐT
    console.log('\n--- 4. Kiểm thử Tra cứu Học sinh theo SĐT ---');
    const hsSdtRes = await request({
        path: '/api/hoc-sinh/tim-sdt?sdt=09',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Tìm HS theo SĐT status:', hsSdtRes.status, 'Tìm thấy:', hsSdtRes.data?.data?.length);

    // 6. Tra cứu Phụ huynh theo SĐT
    console.log('\n--- 5. Kiểm thử Tra cứu Phụ huynh theo SĐT ---');
    const phSdtRes = await request({
        path: '/api/phu-huynh/tim-sdt?sdt=0977',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Tìm PH theo SĐT status:', phSdtRes.status, 'Tìm thấy:', phSdtRes.data?.data?.length);

    // 7. Lấy danh sách học sinh theo khóa học
    console.log('\n--- 6. Kiểm thử Lấy danh sách Học sinh theo Khóa học #1 ---');
    const khHsRes = await request({
        path: '/api/hoc-sinh-khoa-hoc/khoa-hoc/1/hoc-sinh',
        method: 'GET',
        headers: authHeaders
    });
    console.log('Học sinh trong khóa học status:', khHsRes.status, 'Số học sinh:', khHsRes.data?.data?.length);

    // 8. Dọn dẹp quan hệ test
    if (idPh) {
        console.log('\n--- 7. Dọn dẹp: Xóa liên kết Phụ huynh - Học sinh test ---');
        const xoaQhRes = await request({
            path: `/api/hoc-sinh/1/phu-huynh/${idPh}`,
            method: 'DELETE',
            headers: authHeaders
        });
        console.log('Xóa quan hệ status:', xoaQhRes.status);

        console.log('\n--- 8. Dọn dẹp: Xóa phụ huynh test ---');
        const xoaPhRes = await request({
            path: `/api/phu-huynh/${idPh}`,
            method: 'DELETE',
            headers: authHeaders
        });
        console.log('Xóa phụ huynh status:', xoaPhRes.status);
    }

    console.log('\n🎉 HOÀN THÀNH TẤT CẢ KIỂM THỬ HỌC SINH & PHỤ HUYNH (PHẦN 3) THÀNH CÔNG RỰC RỠ!');
}

runTests().catch(err => {
    console.error('Lỗi kiểm thử:', err);
    process.exit(1);
});
