import axios from 'axios';
import { LoginRequest, LoginResponse, TaiKhoan, ApiResponse } from '../kieu_du_lieu/xac_thuc';
import { setCookie, getCookie, eraseCookie } from '../tien_ich/cookie';

const API_URL = '/api';

// Tạo 1 axios instance riêng biệt cho auth để tránh loop interceptor
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const dichVuXacThuc = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await authApi.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const data = response.data.data;
    const token = data?.token || data?.accessToken;
    if (token) {
      setCookie('access_token', token, 7); // Lưu cookie 7 ngày
      localStorage.setItem('access_token', token);
    }
    return data;
  },

  register: async (taiKhoan: TaiKhoan): Promise<TaiKhoan> => {
    const response = await authApi.post<ApiResponse<TaiKhoan>>('/auth/register', taiKhoan);
    return response.data.data;
  },

  refresh: async (): Promise<LoginResponse | null> => {
    try {
      // Gọi refresh token, browser tự đính kèm cookie refreshToken
      const response = await authApi.post<ApiResponse<LoginResponse>>('/auth/refresh');
      const data = response.data.data;
      const token = data?.token || data?.accessToken;
      if (token) {
        setCookie('access_token', token, 7);
        localStorage.setItem('access_token', token);
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.post('/auth/logout');
    } finally {
      dichVuXacThuc.logoutLocal();
    }
  },

  logoutLocal: () => {
    eraseCookie('access_token');
    localStorage.removeItem('access_token');
  },

  isAuthenticated: (): boolean => {
    return !!(getCookie('access_token') || localStorage.getItem('access_token'));
  }
};



