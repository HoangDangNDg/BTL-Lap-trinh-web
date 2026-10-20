import api from '../api';
import { ApiResponse, LoginResponseDto, TaiKhoan } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuAuth = {

  login: async (request: Record<string, string>): Promise<LoginResponseDto> => {
    const response = await api.post(`/api/auth/login`, request);
    return response as any;
  },

  register: async (taiKhoan: TaiKhoan): Promise<TaiKhoan> => {
    const response = await api.post(`/api/auth/register`, taiKhoan);
    return response as any;
  },

  refresh: async (): Promise<LoginResponseDto> => {
    const response = await api.post(`/api/auth/refresh`, {});
    return response as any;
  },

  logout: async (): Promise<void> => {
    const response = await api.post(`/api/auth/logout`, {});
    return response as any;
  },

  resetDevPasswords: async (): Promise<string> => {
    const response = await api.get(`/api/auth/reset-dev-passwords`);
    return response as any;
  },

  getDevAccounts: async (): Promise<Record<string, any>[]> => {
    const response = await api.get(`/api/auth/dev/accounts`);
    return response as any;
  }
};


