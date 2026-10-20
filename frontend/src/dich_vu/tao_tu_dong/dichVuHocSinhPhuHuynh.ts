import api from '../api';
import { ApiResponse, PhuHuynh, HocSinh, PhuHuynhHocSinh, HocSinhKhoaHoc } from '../../kieu_du_lieu/tao_tu_dong';

export const dichVuHocSinhPhuHuynh = {

  getPhuHuynh: async (idPh: number): Promise<PhuHuynh> => {
    const response = await api.get(`/api/phu-huynh/${idPh}`);
    return response as any;
  },

  getPhuHuynhTheoDoanhNghiep: async (idDn: number): Promise<PhuHuynh[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/phu-huynh`);
    return response as any;
  },

  createPhuHuynh: async (idDn: number, phuHuynh: Partial<PhuHuynh>): Promise<PhuHuynh> => {
    const response = await api.post(`/api/doanh-nghiep/${idDn}/phu-huynh`, phuHuynh);
    return response as any;
  },

  updatePhuHuynh: async (idPh: number, phuHuynh: Partial<PhuHuynh>): Promise<PhuHuynh> => {
    const response = await api.put(`/api/phu-huynh/${idPh}`, phuHuynh);
    return response as any;
  },

  timKiemVaGoiYPhuHuynh: async (idDn: number, keyword?: string, goiY: boolean = true): Promise<PhuHuynh[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/phu-huynh`, {
      params: { keyword: keyword || undefined, goiY }
    });
    return response as any;
  },

  timPhuHuynhTheoSdt: async (sdt: string): Promise<PhuHuynh[]> => {
    const response = await api.get(`/api/phu-huynh`, { params: { sdt } });
    return response as any;
  },

  timPhuHuynhTheoCccd: async (cccd: string): Promise<PhuHuynh[]> => {
    const response = await api.get(`/api/phu-huynh`, { params: { cccd } });
    return response as any;
  },

  deletePhuHuynh: async (idPh: number): Promise<void> => {
    const response = await api.delete(`/api/phu-huynh/${idPh}`);
    return response as any;
  },

  getHocSinh: async (idHs: number): Promise<HocSinh> => {
    const response = await api.get(`/api/hoc-sinh/${idHs}`);
    return response as any;
  },

  getHocSinhTheoDoanhNghiep: async (idDn: number): Promise<HocSinh[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/hoc-sinh`);
    return response as any;
  },

  getHocSinhTheoPhuHuynh: async (idPh: number): Promise<HocSinh[]> => {
    const response = await api.get(`/api/phu-huynh/${idPh}/hoc-sinh`);
    return response as any;
  },

  createHocSinh: async (idDn: number, hocSinh: HocSinh): Promise<HocSinh> => {
    const response = await api.post(`/api/doanh-nghiep/${idDn}/hoc-sinh`, hocSinh);
    return response as any;
  },

  updateHocSinh: async (idHs: number, hocSinh: Partial<HocSinh>): Promise<HocSinh> => {
    const response = await api.put(`/api/hoc-sinh/${idHs}`, hocSinh);
    return response as any;
  },

  deleteHocSinh: async (idHs: number): Promise<void> => {
    const response = await api.delete(`/api/hoc-sinh/${idHs}`);
    return response as any;
  },

  getPhuHuynhTheoHocSinh: async (idHs: number): Promise<PhuHuynhHocSinh[]> => {
    const response = await api.get(`/api/hoc-sinh/${idHs}/phu-huynh`);
    return response as any;
  },

  getHocSinhTheoPhuHuynhBangPhu: async (idPh: number): Promise<PhuHuynhHocSinh[]> => {
    const response = await api.get(`/api/phu-huynh/${idPh}/hoc-sinh-bang-phu`);
    return response as any;
  },

  ganQuanHe: async (request: Record<string, any>): Promise<PhuHuynhHocSinh> => {
    const response = await api.post(`/api/phu-huynh-hoc-sinh`, request);
    return response as any;
  },

  taoMoiPhuHuynhChoHocSinh: async (idHs: number, phuHuynh: Partial<PhuHuynh>, quanHe?: string): Promise<PhuHuynh> => {
    const response = await api.post(`/api/hoc-sinh/${idHs}/phu-huynh`, phuHuynh, {
      params: quanHe ? { quanHe } : undefined
    });
    return response as any;
  },

  deletePhuHuynhHocSinh: async (idPhHs: number): Promise<void> => {
    const response = await api.delete(`/api/phu-huynh-hoc-sinh/${idPhHs}`);
    return response as any;
  },

  // =========================================================================
  // TRUY VẤN HỌC SINH THEO KHÓA HỌC & BẢNG TRUNG GIAN (HOC_SINH_KHOA_HOC)
  // =========================================================================

  /** Lấy danh sách đối tượng học sinh đầy đủ theo ID khóa học */
  getHocSinhTheoKhoaHoc: async (idKhoaHoc: number): Promise<HocSinh[]> => {
    const response = await api.get(`/api/hoc-sinh/khoa-hoc/${idKhoaHoc}`);
    const data = (response as any)?.data !== undefined ? (response as any).data : response;
    return Array.isArray(data) ? data : (data?.items || []);
  },

  /** Lấy danh sách bảng trung gian HocSinhKhoaHoc đầy đủ (kèm entity HocSinh) */
  getHocSinhKhoaHocTheoKhoaHoc: async (idKhoaHoc: number): Promise<HocSinhKhoaHoc[]> => {
    const response = await api.get(`/api/hoc-sinh-khoa-hoc/khoa-hoc/${idKhoaHoc}`);
    const data = (response as any)?.data !== undefined ? (response as any).data : response;
    return Array.isArray(data) ? data : (data?.items || []);
  },

  /** Lấy danh sách bảng trung gian rút gọn đã có sẵn ho_ten (không cần JOIN) */
  getHocSinhKhoaHocNganGon: async (idKhoaHoc: number): Promise<HocSinhKhoaHoc[]> => {
    const response = await api.get(`/api/hoc-sinh-khoa-hoc/khoa-hoc/${idKhoaHoc}/ngan-gon`);
    const data = (response as any)?.data !== undefined ? (response as any).data : response;
    return Array.isArray(data) ? data : (data?.items || []);
  },

  /** Gán học sinh vào khóa học (tự động đồng bộ tên học sinh vào bảng trung gian) */
  ganHocSinhKhoaHoc: async (params: { idHs: number; idKhoaHoc: number; idDn?: number; soBuoiDaHoc?: number }): Promise<HocSinhKhoaHoc> => {
    const response = await api.post(`/api/hoc-sinh-khoa-hoc`, null, { params });
    return response as any;
  },

  /** Xóa học sinh khỏi khóa học (đồng bộ cả hoc_sinh_khoa_hoc và dang_ky_hoc) */
  xoaHocSinhKhoaHoc: async (idKhoaHoc: number, idHs: number): Promise<void> => {
    await api.delete(`/api/hoc-sinh-khoa-hoc/khoa-hoc/${idKhoaHoc}/hoc-sinh/${idHs}`);
  },

  /** Tìm kiếm học sinh theo Số Điện Thoại (SĐT) */
  timHocSinhTheoSdt: async (sdt: string): Promise<HocSinh[]> => {
    const response = await api.get(`/api/hoc-sinh`, { params: { sdt } });
    return response as any;
  },

  /** Tìm kiếm học sinh theo Số CCCD / Mã Định Danh */
  timHocSinhTheoCccd: async (cccd: string): Promise<HocSinh[]> => {
    const response = await api.get(`/api/hoc-sinh`, { params: { cccd } });
    return response as any;
  }
};



