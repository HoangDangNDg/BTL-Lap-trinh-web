import api from '../api';
import { ApiResponse, BoMon, KhoaHocDto, KhoaHoc, MonHocKhoaHoc, LopHocDto, KyHoc, LopKyHoc, LopHoc, KhungLichHocCoDinhDto, KhungLichHocCoDinh, BuoiHocDto, BuoiHoc, DangKyHoc, TuanHoc, ThoiKhoaBieuTuanDto, ThoiKhoaBieuTuan } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuAdminDaoTao = {

  getTatCaBoMon: async (): Promise<BoMon[]> => {
    const response = await api.get(`/api/admin/dao-tao/bo-mon`);
    return response as any;
  },

  getKhoaHoc: async (idKhoaHoc: number): Promise<KhoaHocDto> => {
    const response = await api.get(`/api/admin/dao-tao/khoa-hoc/${idKhoaHoc}`);
    return response as any;
  },

  getKhoaHocTheoBoMon: async (idBoMon: number): Promise<KhoaHocDto[]> => {
    const response = await api.get(`/api/admin/dao-tao/bo-mon/${idBoMon}/khoa-hoc`);
    return response as any;
  },

  createKhoaHoc: async (idBoMon: number, khoaHoc: KhoaHoc): Promise<KhoaHocDto> => {
    const response = await api.post(`/api/admin/dao-tao/bo-mon/${idBoMon}/khoa-hoc`, khoaHoc);
    return response as any;
  },

  deleteKhoaHoc: async (idKhoaHoc: number): Promise<void> => {
    const response = await api.delete(`/api/admin/dao-tao/khoa-hoc/${idKhoaHoc}`);
    return response as any;
  },

  getMonHocTheoKhoaHoc: async (idKhoaHoc: number): Promise<MonHocKhoaHoc[]> => {
    const response = await api.get(`/api/admin/dao-tao/khoa-hoc/${idKhoaHoc}/mon-hoc`);
    return response as any;
  },

  getKhoaHocTheoMonHoc: async (idMh: number): Promise<MonHocKhoaHoc[]> => {
    const response = await api.get(`/api/admin/dao-tao/mon-hoc/${idMh}/khoa-hoc`);
    return response as any;
  },

  ganMonHocVaoKhoaHoc: async (idKhoaHoc: number, idMh: number): Promise<MonHocKhoaHoc> => {
    const response = await api.post(`/api/admin/dao-tao/khoa-hoc/${idKhoaHoc}/mon-hoc/${idMh}`, {});
    return response as any;
  },

  deleteMonHocKhoaHoc: async (idMhKh: number): Promise<void> => {
    const response = await api.delete(`/api/admin/dao-tao/mon-hoc-khoa-hoc/${idMhKh}`);
    return response as any;
  },

  getLopHoc: async (idLop: number): Promise<LopHocDto> => {
    const response = await api.get(`/api/admin/dao-tao/lop-hoc/${idLop}`);
    return response as any;
  },

  getLopHocTheoChiNhanh: async (idCn: number): Promise<LopHocDto[]> => {
    const response = await api.get(`/api/admin/dao-tao/chi-nhanh/${idCn}/lop-hoc`);
    return response as any;
  },

  getLopHocTheoKhoaHoc: async (idKhoaHoc: number): Promise<LopHocDto[]> => {
    const response = await api.get(`/api/admin/dao-tao/khoa-hoc/${idKhoaHoc}/lop-hoc`);
    return response as any;
  },

  getTatCaKyHoc: async (): Promise<KyHoc[]> => {
    const response = await api.get(`/api/admin/dao-tao/ky-hoc`);
    return response as any;
  },

  getLopHocTheoKyHoc: async (idKh: number): Promise<LopHocDto[]> => {
    const response = await api.get(`/api/admin/dao-tao/ky-hoc/${idKh}/lop-hoc`);
    return response as any;
  },

  getLopTheoKyHoc: async (idKh: number): Promise<LopKyHoc[]> => {
    const response = await api.get(`/api/admin/dao-tao/ky-hoc/${idKh}/lop`);
    return response as any;
  },

  createLopHoc: async (lopHoc: LopHoc): Promise<LopHocDto> => {
    const response = await api.post(`/api/admin/dao-tao/lop-hoc`, lopHoc);
    return response as any;
  },

  deleteLopHoc: async (idLop: number): Promise<void> => {
    const response = await api.delete(`/api/admin/dao-tao/lop-hoc/${idLop}`);
    return response as any;
  },

  deleteLopKyHoc: async (idLopKyHoc: number): Promise<void> => {
    const response = await api.delete(`/api/admin/dao-tao/lop-ky-hoc/${idLopKyHoc}`);
    return response as any;
  },

  getLichCoDinhTheoLop: async (idLop: number): Promise<KhungLichHocCoDinhDto[]> => {
    const response = await api.get(`/api/admin/dao-tao/lop-hoc/${idLop}/lich-co-dinh`);
    return response as any;
  },

  createLichCoDinh: async (lich: KhungLichHocCoDinh): Promise<KhungLichHocCoDinhDto> => {
    const response = await api.post(`/api/admin/dao-tao/lich-co-dinh`, lich);
    return response as any;
  },

  deleteLichCoDinh: async (idKhungLich: number): Promise<void> => {
    const response = await api.delete(`/api/admin/dao-tao/lich-co-dinh/${idKhungLich}`);
    return response as any;
  },

  getBuoiHocTheoLop: async (idLop: number): Promise<BuoiHocDto[]> => {
    const response = await api.get(`/api/admin/dao-tao/lop-hoc/${idLop}/buoi-hoc`);
    return response as any;
  },

  createBuoiHoc: async (buoiHoc: BuoiHoc): Promise<BuoiHocDto> => {
    const response = await api.post(`/api/admin/dao-tao/buoi-hoc`, buoiHoc);
    return response as any;
  },

  deleteBuoiHoc: async (idBuoiHoc: number): Promise<void> => {
    const response = await api.delete(`/api/admin/dao-tao/buoi-hoc/${idBuoiHoc}`);
    return response as any;
  },

  getDangKyHocTheoHocSinh: async (idHs: number): Promise<DangKyHoc[]> => {
    const response = await api.get(`/api/admin/dao-tao/hoc-sinh/${idHs}/dang-ky-hoc`);
    return response as any;
  },

  getDangKyHocTheoLop: async (idLop: number): Promise<DangKyHoc[]> => {
    const response = await api.get(`/api/admin/dao-tao/lop-hoc/${idLop}/dang-ky-hoc`);
    return response as any;
  },

  dangKyHoc: async (request: Record<string, number>): Promise<DangKyHoc> => {
    const response = await api.post(`/api/admin/dao-tao/dang-ky-hoc`, request);
    return response as any;
  },

  deleteDangKyHoc: async (idDangKy: number): Promise<void> => {
    const response = await api.delete(`/api/admin/dao-tao/dang-ky-hoc/${idDangKy}`);
    return response as any;
  },

  getTatCaTuanHoc: async (): Promise<TuanHoc[]> => {
    const response = await api.get(`/api/admin/dao-tao/tuan-hoc`);
    return response as any;
  },

  getTuanHocTheoKy: async (idKh: number): Promise<TuanHoc[]> => {
    const response = await api.get(`/api/admin/dao-tao/tuan-hoc/ky-hoc/${idKh}`);
    return response as any;
  },

  getThoiKhoaBieuTheoTuan: async (idTh: number): Promise<ThoiKhoaBieuTuanDto[]> => {
    const response = await api.get(`/api/admin/dao-tao/thoi-khoa-bieu/tuan/${idTh}`);
    return response as any;
  },

  getThoiKhoaBieuTheoLop: async (idLop: number): Promise<ThoiKhoaBieuTuanDto[]> => {
    const response = await api.get(`/api/admin/dao-tao/thoi-khoa-bieu/lop/${idLop}`);
    return response as any;
  },

  saveThoiKhoaBieu: async (tkb: ThoiKhoaBieuTuan): Promise<ThoiKhoaBieuTuanDto> => {
    const response = await api.post(`/api/admin/dao-tao/thoi-khoa-bieu`, tkb);
    return response as any;
  },

  deleteThoiKhoaBieu: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/admin/dao-tao/thoi-khoa-bieu/${id}`);
    return response as any;
  }
};


