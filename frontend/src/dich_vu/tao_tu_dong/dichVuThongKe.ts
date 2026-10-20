import api from '../api';
import { NamHoc, KyHoc } from '../../kieu_du_lieu/tao_tu_dong';

export interface ThongKeTongQuanDto {
  tongHocSinh: number;
  tongGiaoVienHoatDong: number;
  idNamHoc: number;
  idKyHoc?: number | null;
  tenNamHoc: string;
  tenKyHoc: string;
}

export const dichVuThongKe = {
  getNamHocTheoDoanhNghiep: async (idDn: number): Promise<NamHoc[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/nam-hoc`);
    return response as any;
  },

  getKyHocTheoNamHoc: async (idNh: number): Promise<KyHoc[]> => {
    const response = await api.get(`/api/nam-hoc/${idNh}/ky-hoc`);
    return response as any;
  },

  getThongKeTongQuan: async (idDn: number, idNamHoc: number, idKyHoc?: number | null): Promise<ThongKeTongQuanDto> => {
    let url = `/api/thong-ke/doanh-nghiep/${idDn}?idNamHoc=${idNamHoc}`;
    if (idKyHoc && idKyHoc > 0) {
      url += `&idKyHoc=${idKyHoc}`;
    }
    const response = await api.get(url);
    return response as any;
  }
};


