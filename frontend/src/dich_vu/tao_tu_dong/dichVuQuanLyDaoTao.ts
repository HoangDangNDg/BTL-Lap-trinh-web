import api from '../api';
import { ApiResponse, LopHocDto } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuQuanLyDaoTao = {

  getLopHocThuocChiNhanh: async (): Promise<LopHocDto[]> => {
    const response = await api.get(`/api/quan-ly/dao-tao/lop-hoc`);
    return response as any;
  }
};


