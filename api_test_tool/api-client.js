/**
 * API Client SDK cho Hệ thống Quản lý Trung tâm Giáo dục
 * Tương thích cả Node.js (v18+) và Trình duyệt Web (Browser)
 */
class ApiClient {
    constructor(baseUrl = 'http://localhost:5120') {
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.token = null;
        this.refreshToken = null;
        this.currentUser = null;
        this.lang = (typeof localStorage !== 'undefined' && localStorage.getItem('APP_LANG')) || 'vi-VN';
    }

    setBaseUrl(url) {
        this.baseUrl = url.replace(/\/+$/, '');
    }

    setLanguage(lang) {
        this.lang = lang;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('APP_LANG', lang);
        }
    }

    getLanguage() {
        return this.lang || 'vi-VN';
    }

    setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    /**
     * Hàm gọi HTTP cốt lõi có đo thời gian phản hồi (latency)
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Accept-Language': this.lang || 'vi-VN',
            ...(options.headers || {})
        };

        if (this.token && !headers['Authorization']) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method: options.method || 'GET',
            headers,
            ...options
        };

        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        const startTime = Date.now();
        try {
            const response = await fetch(url, config);
            const duration = Date.now() - startTime;
            
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            return {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                duration,
                data
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            return {
                ok: false,
                status: 0,
                statusText: 'Network Error',
                duration,
                error: error.message
            };
        }
    }

    // ==========================================
    // 1. AUTHENTICATION APIS
    // ==========================================

    async login(tenDangNhap, matKhau) {
        const res = await this.request('/api/auth/login', {
            method: 'POST',
            body: { tenDangNhap, matKhau }
        });

        if (res.ok && res.data?.data?.token) {
            this.token = res.data.data.token;
            this.refreshToken = res.data.data.refreshToken;
            this.currentUser = res.data.data;
        }

        return res;
    }

    async register(userData) {
        return await this.request('/api/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    async refresh(refreshToken) {
        return await this.request('/api/auth/refresh', {
            method: 'POST',
            body: { refreshToken: refreshToken || this.refreshToken }
        });
    }

    async logout() {
        const res = await this.request('/api/auth/logout', { method: 'POST' });
        this.token = null;
        this.refreshToken = null;
        this.currentUser = null;
        return res;
    }

    // ==========================================
    // 2. HỌC SINH APIS
    // ==========================================

    async getStudents(params = {}) {
        const query = new URLSearchParams();
        if (params.keyword) query.append('keyword', params.keyword);
        if (params.pageIndex) query.append('pageIndex', params.pageIndex);
        if (params.pageSize) query.append('pageSize', params.pageSize);
        if (params.idDn) query.append('idDn', params.idDn);
        if (params.idCn) query.append('idCn', params.idCn);

        const qs = query.toString();
        return await this.request(`/api/v1/hoc-sinh${qs ? '?' + qs : ''}`);
    }

    async getStudentById(idHs) {
        return await this.request(`/api/v1/hoc-sinh/${idHs}`);
    }

    async createStudent(studentData, idDn = 1) {
        return await this.request(`/api/v1/hoc-sinh?idDn=${idDn}`, {
            method: 'POST',
            body: studentData
        });
    }

    async updateStudent(idHs, studentData) {
        return await this.request(`/api/v1/hoc-sinh/${idHs}`, {
            method: 'PUT',
            body: studentData
        });
    }

    async deleteStudent(idHs) {
        return await this.request(`/api/v1/hoc-sinh/${idHs}`, {
            method: 'DELETE'
        });
    }

    async assignCourse(data) {
        return await this.request('/api/v1/hoc-sinh/gan-khoa-hoc', {
            method: 'POST',
            body: data
        });
    }

    async assignCourseBatch(idKhoaHoc, dsIdHs) {
        return await this.request(`/api/v1/hoc-sinh/khoa-hoc/${idKhoaHoc}/batch`, {
            method: 'POST',
            body: dsIdHs
        });
    }

    // ==========================================
    // 3. ĐIỂM DANH APIS
    // ==========================================

    async saveAttendanceBatch(request) {
        return await this.request('/api/v1/diem-danh/hoc-sinh/batch', {
            method: 'POST',
            body: request
        });
    }

    async getSessionAttendance(idBuoiHoc) {
        return await this.request(`/api/v1/diem-danh/buoi-hoc/${idBuoiHoc}`);
    }

    async teacherAttendance(request) {
        return await this.request('/api/v1/diem-danh/giao-vien', {
            method: 'POST',
            body: request
        });
    }

    // ==========================================
    // 4. TÀI CHÍNH APIS
    // ==========================================

    async createTuitionReceipt(request) {
        return await this.request('/api/v1/tai-chinh/phieu-thu', {
            method: 'POST',
            body: request
        });
    }

    async getStudentReceipts(idHs) {
        return await this.request(`/api/v1/tai-chinh/phieu-thu/hoc-sinh/${idHs}`);
    }

    async getFinancialSummary(idDn = 1, tuNgay = null, denNgay = null) {
        const query = new URLSearchParams({ idDn });
        if (tuNgay) query.append('tuNgay', tuNgay);
        if (denNgay) query.append('denNgay', denNgay);
        return await this.request(`/api/v1/tai-chinh/bao-cao-tong-hop?${query.toString()}`);
    }

    async recordCashbook(entry) {
        return await this.request('/api/v1/tai-chinh/so-quy', {
            method: 'POST',
            body: entry
        });
    }
}

// Export cho cả Node.js và Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
}
if (typeof window !== 'undefined') {
    window.ApiClient = ApiClient;
}
