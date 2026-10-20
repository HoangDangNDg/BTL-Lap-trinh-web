import api from '../api';
import { ApiResponse, LopHocDto, BoMon, KyHoc, TuanHoc, ThoiKhoaBieuTuanDto, NamHoc } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuChuDoanhNghiepDaoTao = {

  // ── 1. NĂM HỌC (ACADEMIC YEAR) ──
  getDanhSachNamHoc: async (idDn?: number): Promise<NamHoc[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const response = await api.get<any, any>(`/api/doanh-nghiep/dao-tao/nam-hoc${params}`);
    return (response?.data !== undefined ? response.data : response) || [];
  },

  taoNamHoc: async (data: Partial<NamHoc>, idDn?: number, taoTuanHocHangLoat: boolean = false): Promise<NamHoc> => {
    const params = new URLSearchParams();
    if (idDn) params.append('idDn', String(idDn));
    if (taoTuanHocHangLoat) params.append('taoTuanHocHangLoat', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await api.post<any, any>(`/api/doanh-nghiep/dao-tao/nam-hoc${qs}`, data);
    return response?.data !== undefined ? response.data : response;
  },

  doiTrangThaiHoanThanhNamHoc: async (idNh: number, daHoanThanh: boolean): Promise<NamHoc> => {
    const response = await api.patch<any, any>(`/api/doanh-nghiep/dao-tao/nam-hoc/${idNh}/trang-thai?daHoanThanh=${daHoanThanh}`);
    return response?.data !== undefined ? response.data : response;
  },

  xoaNamHoc: async (idNh: number): Promise<void> => {
    await api.delete(`/api/doanh-nghiep/dao-tao/nam-hoc/${idNh}`);
  },

  // ── 2. TUẦN HỌC HÀNG LOẠT THEO NĂM HỌC ──
  taoTuanHocHangLoatTheoNamHoc: async (idNh: number): Promise<TuanHoc[]> => {
    const response = await api.post<any, any>(`/api/doanh-nghiep/dao-tao/nam-hoc/${idNh}/tao-tuan-hoc-hang-loat`);
    return (response?.data !== undefined ? response.data : response) || [];
  },

  getTuanHocTheoNamHoc: async (idNh: number): Promise<TuanHoc[]> => {
    const response = await api.get<any, any>(`/api/doanh-nghiep/dao-tao/nam-hoc/${idNh}/tuan-hoc`);
    return (response?.data !== undefined ? response.data : response) || [];
  },

  getKyHocTheoNamHoc: async (idNh: number): Promise<KyHoc[]> => {
    const response = await api.get<any, any>(`/api/doanh-nghiep/dao-tao/nam-hoc/${idNh}/terms`);
    return (response?.data !== undefined ? response.data : response) || [];
  },

  // ── 3. LỚP HỌC & BỘ MÔN ──
  getLopHocThuocDoanhNghiep: async (): Promise<LopHocDto[]> => {
    const response = await api.get(`/api/doanh-nghiep/dao-tao/lop-hoc`);
    return response as any;
  },

  getBoMonThuocDoanhNghiep: async (): Promise<BoMon[]> => {
    const response = await api.get(`/api/doanh-nghiep/dao-tao/bo-mon`);
    return response as any;
  },

  getKyHocThuocDoanhNghiep: async (): Promise<KyHoc[]> => {
    const response = await api.get(`/api/doanh-nghiep/dao-tao/ky-hoc`);
    return response as any;
  },

  getLopHocTheoKyHoc: async (idKh: number): Promise<LopHocDto[]> => {
    const response = await api.get(`/api/doanh-nghiep/dao-tao/ky-hoc/${idKh}/lop-hoc`);
    return response as any;
  },

  getTuanHocThuocDoanhNghiep: async (): Promise<TuanHoc[]> => {
    const response = await api.get(`/api/doanh-nghiep/dao-tao/tuan-hoc`);
    return response as any;
  },

  getThoiKhoaBieuTheoTuan: async (idTh: number): Promise<ThoiKhoaBieuTuanDto[]> => {
    const response = await api.get(`/api/doanh-nghiep/dao-tao/thoi-khoa-bieu/tuan/${idTh}`);
    return response as any;
  },

  getAllThoiKhoaBieuThuocDoanhNghiep: async (): Promise<ThoiKhoaBieuTuanDto[]> => {
    const response = await api.get(`/api/doanh-nghiep/dao-tao/thoi-khoa-bieu`);
    return response as any;
  },

  // ── 4. QUẢN TRỊ BỘ MÔN, MÔN HỌC & TẠO LỚP THEO BỘ MÔN ──
  taoBoMon: async (bm: Partial<BoMon>, idDn?: number): Promise<BoMon> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res: any = await api.post(`/api/doanh-nghiep/dao-tao/bo-mon${params}`, bm);
    return res?.data !== undefined ? res.data : res;
  },

  capNhatBoMon: async (id: number, bm: Partial<BoMon>): Promise<BoMon> => {
    const res: any = await api.put(`/api/doanh-nghiep/dao-tao/bo-mon/${id}`, bm);
    return res?.data !== undefined ? res.data : res;
  },

  xoaBoMon: async (id: number): Promise<void> => {
    await api.delete(`/api/doanh-nghiep/dao-tao/bo-mon/${id}`);
  },

  taoMonHoc: async (idBoMon: number, idChuyenMon: number, monHoc: any): Promise<any> => {
    const res: any = await api.post(`/api/doanh-nghiep/dao-tao/mon-hoc?idBoMon=${idBoMon}&idChuyenMon=${idChuyenMon}`, monHoc);
    return res?.data !== undefined ? res.data : res;
  },

  capNhatMonHoc: async (id: number, monHoc: any): Promise<any> => {
    const res: any = await api.put(`/api/doanh-nghiep/dao-tao/mon-hoc/${id}`, monHoc);
    return res?.data !== undefined ? res.data : res;
  },

  xoaMonHoc: async (id: number): Promise<void> => {
    await api.delete(`/api/doanh-nghiep/dao-tao/mon-hoc/${id}`);
  },

  taoChuyenMon: async (cm: any, idDn?: number): Promise<any> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res: any = await api.post(`/api/doanh-nghiep/dao-tao/chuyen-mon${params}`, cm);
    return res?.data !== undefined ? res.data : res;
  },

  phanCongGiaoVienChoLop: async (idLop: number, idGv: number): Promise<any> => {
    const res: any = await api.post(`/api/doanh-nghiep/dao-tao/lop-hoc/${idLop}/phan-cong-gv?idGv=${idGv}`);
    return res?.data !== undefined ? res.data : res;
  },

  taoNhanhLopTheoBoMon: async (payload: any, idDn?: number): Promise<any> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res: any = await api.post(`/api/doanh-nghiep/dao-tao/tao-lop-theo-bo-mon${params}`, payload);
    return res?.data !== undefined ? res.data : res;
  }
};


