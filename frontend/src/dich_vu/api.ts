import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { dichVuXacThuc } from './dichVuXacThuc';
import { getCookie } from '../tien_ich/cookie';
import { phatSuKienLoi } from '../tien_ich/thongBaoLoi';

const api: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng để gửi/nhận HttpOnly Cookie (refreshToken)
});

// Request Interceptor: Tự động chuẩn hóa URL và đính kèm Token vào mỗi request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Chuẩn hóa đường dẫn: Tránh bị nhân đôi /api/api và đảm bảo luôn có tiền tố /api
    if (config.url) {
      // Xóa các tiền tố /api bị lặp lại như /api/api/ -> /api/
      config.url = config.url.replace(/^(\/api)+/, '/api');
      if (!config.url.startsWith('/api') && !config.url.startsWith('http')) {
        config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
      }
    }

    // Lấy token từ cookie (ưu tiên) hoặc localStorage
    const token = getCookie('access_token') || localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Bắt lỗi 401/403 và phát sự kiện báo lỗi thân thiện toàn cục
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data; // .NET Web API trả về ApiResponse<T> { success, statusCode, message, data, errors }
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const { status, data } = error.response;
      
      // Xử lý hết hạn token (401)
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Đánh dấu đã thử lại
        try {
          // Gọi API refresh token (sử dụng HttpOnly cookie tự động gửi đi)
          const newAccessToken = await dichVuXacThuc.refresh();
          if (newAccessToken) {
            const tokenStr = typeof newAccessToken === 'string'
              ? newAccessToken
              : ((newAccessToken as any)?.token || (newAccessToken as any)?.accessToken);
            // Cập nhật token mới vào request bị lỗi và gửi lại
            if (originalRequest.headers && tokenStr) {
              originalRequest.headers.Authorization = `Bearer ${tokenStr}`;
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Refresh token failed. User must re-login.');
          dichVuXacThuc.logoutLocal();
          window.location.href = '/login'; // Chuyển về login
          return Promise.reject(refreshError);
        }
      } else if (status === 403) {
        console.error('Forbidden! Bạn không có quyền truy cập API này.');
      }
      
      // Phát sự kiện thông báo lỗi nhẹ nhàng đến giao diện
      phatSuKienLoi(error);
      return Promise.reject(data);
    }
    
    // Lỗi mạng hoặc server không phản hồi
    phatSuKienLoi(error);
    return Promise.reject(error);
  }
);

export default api;



