import api from '../api';
import { ApiResponse, DoanhNghiep, ChiNhanh, ChuCoDong, GopVonSoHuu, QuanLy } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuDoanhNghiep = {

  getAllDoanhNghiep: async (): Promise<DoanhNghiep[]> => {
    const response = await api.get(`/api/doanh-nghiep`);
    return response as any;
  },

  getDoanhNghiep: async (idDn: number): Promise<DoanhNghiep> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}`);
    return response as any;
  },

  createDoanhNghiep: async (doanhNghiep: DoanhNghiep): Promise<DoanhNghiep> => {
    const response = await api.post(`/api/doanh-nghiep`, doanhNghiep);
    return response as any;
  },

  getAllChiNhanh: async (): Promise<ChiNhanh[]> => {
    const response = await api.get(`/api/dao-tao-chung/chi-nhanh`);
    return response as any;
  },

  getChiNhanhTheoDoanhNghiep: async (idDn: number): Promise<ChiNhanh[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/chi-nhanh`);
    return response as any;
  },

  createChiNhanh: async (idDn: number, chiNhanh: ChiNhanh): Promise<ChiNhanh> => {
    const response = await api.post(`/api/doanh-nghiep/${idDn}/chi-nhanh`, chiNhanh);
    return response as any;
  },

  getChuCoDongTheoDoanhNghiep: async (idDn: number): Promise<ChuCoDong[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/chu-co-dong`);
    return response as any;
  },

  createChuCoDong: async (idDn: number, chuCoDong: ChuCoDong): Promise<ChuCoDong> => {
    const response = await api.post(`/api/doanh-nghiep/${idDn}/chu-co-dong`, chuCoDong);
    return response as any;
  },

  deleteChuCoDong: async (idCd: number): Promise<void> => {
    const response = await api.delete(`/api/chu-co-dong/${idCd}`);
    return response as any;
  },

  getGopVonTheoDoanhNghiep: async (idDn: number): Promise<GopVonSoHuu[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/gop-von`);
    return response as any;
  },

  getGopVonTheoChuCoDong: async (idCd: number): Promise<GopVonSoHuu[]> => {
    const response = await api.get(`/api/chu-co-dong/${idCd}/gop-von`);
    return response as any;
  },

  createGopVon: async (gopVon: GopVonSoHuu): Promise<GopVonSoHuu> => {
    const response = await api.post(`/api/gop-von`, gopVon);
    return response as any;
  },

  deleteGopVon: async (idGopVon: number): Promise<void> => {
    const response = await api.delete(`/api/gop-von/${idGopVon}`);
    return response as any;
  },

  getQuanLyTheoDoanhNghiep: async (idDn: number): Promise<QuanLy[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/quan-ly`);
    return response as any;
  },

  getQuanLyTheoChiNhanh: async (idCn: number): Promise<QuanLy[]> => {
    const response = await api.get(`/api/chi-nhanh/${idCn}/quan-ly`);
    return response as any;
  },

  createQuanLy: async (quanLy: QuanLy): Promise<QuanLy> => {
    const response = await api.post(`/api/quan-ly`, quanLy);
    return response as any;
  },

  getPhongHocTheoChiNhanh: async (idCn: number): Promise<any[]> => {
    const response = await api.get(`/api/chi-nhanh/${idCn}/phong-hoc`);
    return response?.data !== undefined ? response.data : response;
  },

  createPhongHoc: async (idCn: number, phongHoc: any): Promise<any> => {
    const response = await api.post(`/api/chi-nhanh/${idCn}/phong-hoc`, phongHoc);
    return response?.data !== undefined ? response.data : response;
  },

  deletePhongHoc: async (idPhong: number): Promise<void> => {
    const response = await api.delete(`/api/phong-hoc/${idPhong}`);
    return response as any;
  },

  createQuanLyChiNhanh: async (idCn: number, quanLy: any): Promise<any> => {
    const response = await api.post(`/api/chi-nhanh/${idCn}/quan-ly`, quanLy);
    return response?.data !== undefined ? response.data : response;
  },

  deleteQuanLy: async (idQly: number): Promise<void> => {
    const response = await api.delete(`/api/quan-ly/${idQly}`);
    return response as any;
  }
};


