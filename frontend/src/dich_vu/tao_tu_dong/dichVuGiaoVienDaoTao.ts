import api from '../api';
import { ApiResponse, LopHocDto } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuGiaoVienDaoTao = {

  getLopHocCuaToi: async (): Promise<LopHocDto[]> => {
    const response = await api.get(`/api/giao-vien/dao-tao/lop-hoc`);
    return response as any;
  }
};


