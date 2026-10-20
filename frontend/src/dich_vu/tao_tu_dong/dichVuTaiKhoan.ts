import api from '../api';
import { ApiResponse } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuTaiKhoan = {

  xoaTaiKhoan: async (idTk: number): Promise<void> => {
    const response = await api.delete(`/api/tai-khoan/${idTk}`);
    return response as any;
  }
};


