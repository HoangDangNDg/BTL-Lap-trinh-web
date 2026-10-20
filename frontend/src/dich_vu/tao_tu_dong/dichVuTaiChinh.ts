import api from '../api';
import { ApiResponse, BaoLuuKhoaHoc, DiemDanhHocSinh, DiemDanhGiaoVien, PhieuThuHocPhi, ThanhToanGiaoVien, SoQuyThuChi } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuTaiChinh = {

  getBaoLuuTheoHocSinh: async (idHs: number): Promise<BaoLuuKhoaHoc[]> => {
    const response = await api.get(`/api/hoc-sinh/${idHs}/bao-luu`);
    return response as any;
  },

  lapPhieuBaoLuu: async (baoLuu: BaoLuuKhoaHoc): Promise<BaoLuuKhoaHoc> => {
    const response = await api.post(`/api/bao-luu`, baoLuu);
    return response as any;
  },

  deleteBaoLuu: async (idBaoLuu: number): Promise<void> => {
    const response = await api.delete(`/api/bao-luu/${idBaoLuu}`);
    return response as any;
  },

  getDiemDanhHocSinhTheoBuoi: async (idBuoiHoc: number): Promise<DiemDanhHocSinh[]> => {
    const response = await api.get(`/api/buoi-hoc/${idBuoiHoc}/diem-danh-hoc-sinh`);
    return response as any;
  },

  getDiemDanhHocSinhTheoHocSinh: async (idHs: number): Promise<DiemDanhHocSinh[]> => {
    const response = await api.get(`/api/hoc-sinh/${idHs}/diem-danh`);
    return response as any;
  },

  capNhatDiemDanhHocSinh: async (idBuoiHoc: number, payload: { idKhoaHoc?: number; listIdHocSinh: number[] } | DiemDanhHocSinh[] | any): Promise<void> => {
    const response = await api.post(`/api/buoi-hoc/${idBuoiHoc}/diem-danh-hoc-sinh`, payload);
    return response as any;
  },

  getDiemDanhGiaoVienTheoBuoi: async (idBuoiHoc: number): Promise<DiemDanhGiaoVien[]> => {
    const response = await api.get(`/api/buoi-hoc/${idBuoiHoc}/diem-danh-giao-vien`);
    return response as any;
  },

  getDiemDanhGiaoVienTheoGiaoVien: async (idGv: number): Promise<DiemDanhGiaoVien[]> => {
    const response = await api.get(`/api/giao-vien/${idGv}/diem-danh`);
    return response as any;
  },

  capNhatDiemDanhGiaoVien: async (idBuoiHoc: number, danhSachDiemDanh: DiemDanhGiaoVien[]): Promise<void> => {
    const response = await api.post(`/api/buoi-hoc/${idBuoiHoc}/diem-danh-giao-vien`, danhSachDiemDanh);
    return response as any;
  },

  getPhieuThuTheoHocSinh: async (idHs: number): Promise<PhieuThuHocPhi[]> => {
    const response = await api.get(`/api/hoc-sinh/${idHs}/phieu-thu`);
    return response as any;
  },

  getPhieuThuTheoDangKyHoc: async (idDangKy: number): Promise<PhieuThuHocPhi[]> => {
    const response = await api.get(`/api/dang-ky-hoc/${idDangKy}/phieu-thu`);
    return response as any;
  },

  getPhieuThuTheoKhoaHoc: async (idKhoaHoc: number): Promise<PhieuThuHocPhi[]> => {
    const response = await api.get(`/api/khoa-hoc/${idKhoaHoc}/phieu-thu`);
    return response as any;
  },

  getThanhToanHocPhiTheoKhoaHoc: async (idKhoaHoc: number): Promise<any[]> => {
    const response = await api.get(`/api/khoa-hoc/${idKhoaHoc}/thanh-toan-hoc-phi`);
    return response as any;
  },

  lapPhieuThuHocPhi: async (phieuThu: PhieuThuHocPhi): Promise<PhieuThuHocPhi> => {
    const response = await api.post(`/api/phieu-thu`, phieuThu);
    return response as any;
  },

  deletePhieuThu: async (idPhieuThu: number): Promise<void> => {
    const response = await api.delete(`/api/phieu-thu/${idPhieuThu}`);
    return response as any;
  },

  getThanhToanTheoGiaoVien: async (idGv: number): Promise<ThanhToanGiaoVien[]> => {
    const response = await api.get(`/api/giao-vien/${idGv}/thanh-toan`);
    return response as any;
  },

  getThanhToanTheoDoanhNghiep: async (idDn: number): Promise<ThanhToanGiaoVien[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/thanh-toan-giao-vien`);
    return response as any;
  },

  thanhToanLuongGiaoVien: async (thanhToan: ThanhToanGiaoVien): Promise<ThanhToanGiaoVien> => {
    const response = await api.post(`/api/thanh-toan-giao-vien`, thanhToan);
    return response as any;
  },

  deleteThanhToanGiaoVien: async (idThanhToan: number): Promise<void> => {
    const response = await api.delete(`/api/thanh-toan-giao-vien/${idThanhToan}`);
    return response as any;
  },

  getGiaoDichTheoChiNhanh: async (idCn: number): Promise<SoQuyThuChi[]> => {
    const response = await api.get(`/api/chi-nhanh/${idCn}/giao-dich`);
    return response as any;
  },

  getSoQuyTheoDoanhNghiep: async (idDn?: number): Promise<SoQuyThuChi[]> => {
    const url = idDn ? `/api/doanh-nghiep/${idDn}/so-quy` : `/api/so-quy`;
    const response = await api.get(url);
    return response as any;
  },

  createGiaoDich: async (idCn: number, giaoDich: any): Promise<SoQuyThuChi> => {
    const response = await api.post(`/api/chi-nhanh/${idCn}/giao-dich`, giaoDich);
    return response as any;
  },

  deleteSoQuyThuChi: async (idGd: number): Promise<void> => {
    const response = await api.delete(`/api/giao-dich/${idGd}`);
    return response as any;
  }
};


