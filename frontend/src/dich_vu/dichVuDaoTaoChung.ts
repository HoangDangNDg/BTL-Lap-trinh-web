import api from './api';
import {
  NamHoc,
  KyHoc,
  TuanHoc,
  KhoaHocDto,
  LopHocDto,
  BuoiHocDto,
  ThoiKhoaBieuTuanDto,
  BoMon,
  ChiNhanh,
  PhongHoc,
  DangKyHoc
} from '../kieu_du_lieu/tao_tu_dong';

interface ResponseWrapper<T> {
  success?: boolean;
  statusCode?: number;
  code?: number;
  message?: string;
  data: T;
}

const unwrap = <T>(res: any): T => {
  if (res && res.data !== undefined && (res.code !== undefined || res.statusCode !== undefined || res.success !== undefined)) {
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items as unknown as T;
    }
    return res.data;
  }
  if (res && Array.isArray(res.items)) {
    return res.items as unknown as T;
  }
  return res as T;
};

/**
 * =========================================================================
 * DỊCH VỤ ĐÀO TẠO DÙNG CHUNG (READ-ONLY)
 * =========================================================================
 * Phục vụ cả 4 vai trò (ADMIN, CHU_DOANH_NGHIEP, QUAN_LY, GIAO_VIEN).
 * Tất cả các hàm đều gọi đến Controller dùng chung `/api/dao-tao-chung/*`.
 */
export const dichVuDaoTaoChung = {
  // ── 1. NĂM HỌC, KỲ HỌC, TUẦN HỌC ──
  getDanhSachNamHoc: async (idDn?: number): Promise<NamHoc[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/nam-hoc${params}`);
    return unwrap<NamHoc[]>(res) || [];
  },

  getNamHocTheoDoanhNghiep: async (idDn: number): Promise<NamHoc[]> => {
    const res = await api.get(`/api/dao-tao-chung/doanh-nghiep/${idDn}/nam-hoc`);
    return unwrap<NamHoc[]>(res) || [];
  },

  getNamHocTheoId: async (idNh: number): Promise<NamHoc> => {
    const res = await api.get(`/api/dao-tao-chung/nam-hoc/${idNh}`);
    return unwrap<NamHoc>(res);
  },

  getDanhSachKyHoc: async (idDn?: number, idNh?: number): Promise<KyHoc[]> => {
    const query = new URLSearchParams();
    if (idDn) query.append('idDn', String(idDn));
    if (idNh) query.append('idNh', String(idNh));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/api/dao-tao-chung/ky-hoc${qs}`);
    return unwrap<KyHoc[]>(res) || [];
  },

  getKyHocTheoNamHoc: async (idNh: number): Promise<KyHoc[]> => {
    const res = await api.get(`/api/dao-tao-chung/nam-hoc/${idNh}/ky-hoc`);
    return unwrap<KyHoc[]>(res) || [];
  },

  getKyHocTheoDoanhNghiep: async (idDn: number): Promise<KyHoc[]> => {
    const res = await api.get(`/api/dao-tao-chung/doanh-nghiep/${idDn}/ky-hoc`);
    return unwrap<KyHoc[]>(res) || [];
  },

  getDanhSachTuanHoc: async (idDn?: number, idKh?: number): Promise<TuanHoc[]> => {
    const query = new URLSearchParams();
    if (idDn) query.append('idDn', String(idDn));
    if (idKh) query.append('idKh', String(idKh));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/api/dao-tao-chung/tuan-hoc${qs}`);
    return unwrap<TuanHoc[]>(res) || [];
  },

  getTuanHocTheoKyHoc: async (idKh: number): Promise<TuanHoc[]> => {
    const res = await api.get(`/api/dao-tao-chung/ky-hoc/${idKh}/tuan-hoc`);
    return unwrap<TuanHoc[]>(res) || [];
  },

  getTuanHocTheoDoanhNghiep: async (idDn: number): Promise<TuanHoc[]> => {
    const res = await api.get(`/api/dao-tao-chung/doanh-nghiep/${idDn}/tuan-hoc`);
    return unwrap<TuanHoc[]>(res) || [];
  },

  getTuanHocTheoId: async (idTh: number): Promise<TuanHoc> => {
    const res = await api.get(`/api/dao-tao-chung/tuan-hoc/${idTh}`);
    return unwrap<TuanHoc>(res);
  },

  // ── 2. KHÓA HỌC ──
  getDanhSachKhoaHoc: async (idDn?: number, idBoMon?: number): Promise<KhoaHocDto[]> => {
    const query = new URLSearchParams();
    if (idDn) query.append('idDn', String(idDn));
    if (idBoMon) query.append('idBoMon', String(idBoMon));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/api/dao-tao-chung/khoa-hoc${qs}`);
    return unwrap<KhoaHocDto[]>(res) || [];
  },

  getKhoaHocTheoId: async (idKhoaHoc: number): Promise<KhoaHocDto> => {
    const res = await api.get(`/api/dao-tao-chung/khoa-hoc/${idKhoaHoc}`);
    return unwrap<KhoaHocDto>(res);
  },

  getKhoaHocTheoBoMon: async (idBoMon: number): Promise<KhoaHocDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/bo-mon/${idBoMon}/khoa-hoc`);
    return unwrap<KhoaHocDto[]>(res) || [];
  },

  getKhoaHocTheoLop: async (idLop: number): Promise<KhoaHocDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/lop-hoc/${idLop}/khoa-hoc`);
    return unwrap<KhoaHocDto[]>(res) || [];
  },

  // ── 3. LỚP HỌC ──
  getDanhSachLopHoc: async (params?: {
    idDn?: number;
    idKh?: number;
    idKyHoc?: number;
    idKhoaHoc?: number;
    idCn?: number;
    idBoMon?: number;
    idMh?: number;
    idGv?: number;
    keyword?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<LopHocDto[]> => {
    const query = new URLSearchParams();
    if (params?.idDn) query.append('idDn', String(params.idDn));
    const effectiveKy = params?.idKyHoc || params?.idKh;
    if (effectiveKy) {
      query.append('idKh', String(effectiveKy));
      query.append('idKyHoc', String(effectiveKy));
    }
    if (params?.idKhoaHoc) query.append('idKhoaHoc', String(params.idKhoaHoc));
    if (params?.idCn) query.append('idCn', String(params.idCn));
    if (params?.idBoMon) query.append('idBoMon', String(params.idBoMon));
    if (params?.idMh) query.append('idMh', String(params.idMh));
    if (params?.idGv) query.append('idGv', String(params.idGv));
    if (params?.keyword) query.append('keyword', params.keyword);
    query.append('pageSize', String(params?.pageSize || 200));
    if (params?.pageIndex) query.append('pageIndex', String(params.pageIndex));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/api/dao-tao-chung/lop-hoc${qs}`);
    const data = unwrap<any>(res);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  },

  getLopHocTheoMonHoc: async (idMh: number, idKh?: number): Promise<LopHocDto[]> => {
    const qs = idKh ? `?idKh=${idKh}` : '';
    const res = await api.get(`/api/dao-tao-chung/mon-hoc/${idMh}/lop-hoc${qs}`);
    return unwrap<LopHocDto[]>(res) || [];
  },

  getLopHocTheoBoMon: async (idBoMon: number, idKh?: number): Promise<LopHocDto[]> => {
    const qs = idKh ? `?idKh=${idKh}` : '';
    const res = await api.get(`/api/dao-tao-chung/bo-mon/${idBoMon}/lop-hoc${qs}`);
    return unwrap<LopHocDto[]>(res) || [];
  },

  getLopHocTheoId: async (idLop: number): Promise<LopHocDto> => {
    const res = await api.get(`/api/dao-tao-chung/lop-hoc/${idLop}`);
    return unwrap<LopHocDto>(res);
  },

  getLopHocTheoKy: async (idKh: number): Promise<LopHocDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/ky-hoc/${idKh}/lop-hoc`);
    return unwrap<LopHocDto[]>(res) || [];
  },

  getLopHocTheoKhoaHoc: async (idKhoaHoc: number): Promise<LopHocDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/khoa-hoc/${idKhoaHoc}/lop-hoc`);
    return unwrap<LopHocDto[]>(res) || [];
  },

  getLopHocTheoChiNhanh: async (idCn: number): Promise<LopHocDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/chi-nhanh/${idCn}/lop-hoc`);
    return unwrap<LopHocDto[]>(res) || [];
  },

  // ── 4. BUỔI HỌC / LỊCH HỌC ──
  getBuoiHocTheoLop: async (idLop: number): Promise<BuoiHocDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/lop-hoc/${idLop}/buoi-hoc`);
    return unwrap<BuoiHocDto[]>(res) || [];
  },

  getBuoiHocTheoKhoaHoc: async (idKhoaHoc: number): Promise<BuoiHocDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/khoa-hoc/${idKhoaHoc}/buoi-hoc`);
    return unwrap<BuoiHocDto[]>(res) || [];
  },

  getBuoiHocTheoId: async (idBuoiHoc: number): Promise<BuoiHocDto> => {
    const res = await api.get(`/api/dao-tao-chung/buoi-hoc/${idBuoiHoc}`);
    return unwrap<BuoiHocDto>(res);
  },

  // ── 5. THỜI KHÓA BIỂU TUẦN ──
  getThoiKhoaBieuTheoTuan: async (idTh: number, idCn?: number, idDn?: number): Promise<ThoiKhoaBieuTuanDto[]> => {
    const query = new URLSearchParams();
    if (idCn) query.append('idCn', String(idCn));
    if (idDn) query.append('idDn', String(idDn));
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/api/dao-tao-chung/thoi-khoa-bieu/tuan/${idTh}${qs}`);
    return unwrap<ThoiKhoaBieuTuanDto[]>(res) || [];
  },

  getAllThoiKhoaBieu: async (idDn?: number): Promise<ThoiKhoaBieuTuanDto[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/thoi-khoa-bieu/all${params}`);
    return unwrap<ThoiKhoaBieuTuanDto[]>(res) || [];
  },

  getThoiKhoaBieuTheoLop: async (idLop: number): Promise<ThoiKhoaBieuTuanDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/thoi-khoa-bieu/lop/${idLop}`);
    return unwrap<ThoiKhoaBieuTuanDto[]>(res) || [];
  },

  getThoiKhoaBieuTheoPhong: async (idPhong: number): Promise<ThoiKhoaBieuTuanDto[]> => {
    const res = await api.get(`/api/dao-tao-chung/thoi-khoa-bieu/phong/${idPhong}`);
    return unwrap<ThoiKhoaBieuTuanDto[]>(res) || [];
  },

  // ── 6. DANH MỤC BỔ TRỢ (BỘ MÔN, CHI NHÁNH, PHÒNG HỌC) ──
  getDanhSachBoMon: async (idDn?: number): Promise<BoMon[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/bo-mon${params}`);
    return unwrap<BoMon[]>(res) || [];
  },

  getMonHocTheoBoMon: async (idBoMon: number): Promise<any[]> => {
    const res = await api.get(`/api/dao-tao-chung/bo-mon/${idBoMon}/mon-hoc`);
    return unwrap<any[]>(res) || [];
  },

  getGiaoVienTheoBoMon: async (idBoMon: number, idDn?: number): Promise<any[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/bo-mon/${idBoMon}/giao-vien${params}`);
    return unwrap<any[]>(res) || [];
  },

  getThongKeBoMon: async (idBoMon: number, idDn?: number): Promise<any> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/bo-mon/${idBoMon}/thong-ke${params}`);
    return unwrap<any>(res);
  },

  getChuyenMonTheoBoMon: async (idBoMon: number, idDn?: number): Promise<any[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/bo-mon/${idBoMon}/chuyen-mon${params}`);
    return unwrap<any[]>(res) || [];
  },

  getGiaoVienTheoChuyenMon: async (idCm: number, idDn?: number): Promise<any[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/chuyen-mon/${idCm}/giao-vien${params}`);
    return unwrap<any[]>(res) || [];
  },

  getMonHocTheoBoMonVaChuyenMon: async (idBoMon: number, idCm: number): Promise<any[]> => {
    const res = await api.get(`/api/dao-tao-chung/bo-mon/${idBoMon}/chuyen-mon/${idCm}/mon-hoc`);
    return unwrap<any[]>(res) || [];
  },

  getDanhSachChuyenMon: async (idDn?: number): Promise<any[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/chuyen-mon${params}`);
    return unwrap<any[]>(res) || [];
  },

  getDanhSachChiNhanh: async (idDn?: number): Promise<ChiNhanh[]> => {
    const params = idDn ? `?idDn=${idDn}` : '';
    const res = await api.get(`/api/dao-tao-chung/chi-nhanh${params}`);
    return unwrap<ChiNhanh[]>(res) || [];
  },

  getDanhSachPhongHoc: async (idCn?: number): Promise<PhongHoc[]> => {
    const params = idCn ? `?idCn=${idCn}` : '';
    const res = await api.get(`/api/dao-tao-chung/phong-hoc${params}`);
    return unwrap<PhongHoc[]>(res) || [];
  },

  // ── 7. ĐĂNG KÝ HỌC ──
  getDangKyHocTheoLop: async (idLop: number): Promise<DangKyHoc[]> => {
    const res = await api.get(`/api/dao-tao-chung/lop-hoc/${idLop}/dang-ky-hoc`);
    return unwrap<DangKyHoc[]>(res) || [];
  },

  getDangKyHocTheoHocSinh: async (idHs: number): Promise<DangKyHoc[]> => {
    const res = await api.get(`/api/dao-tao-chung/hoc-sinh/${idHs}/dang-ky-hoc`);
    return unwrap<DangKyHoc[]>(res) || [];
  },

  themHocSinhVaoLop: async (idLop: number, idHs: number, idPh?: number, payload?: any): Promise<DangKyHoc> => {
    const query = new URLSearchParams({ idHs: String(idHs) });
    if (idPh) query.append('idPh', String(idPh));
    const res = await api.post(`/api/dao-tao-chung/lop-hoc/${idLop}/dang-ky-hoc?${query.toString()}`, payload || {});
    return unwrap<DangKyHoc>(res);
  },

  xoaDangKyHoc: async (idDangKy: number): Promise<void> => {
    await api.delete(`/api/dao-tao-chung/dang-ky-hoc/${idDangKy}`);
  },

  xoaHocSinhKhoiLop: async (idLop: number, idHs: number): Promise<void> => {
    await api.delete(`/api/dao-tao-chung/lop-hoc/${idLop}/hoc-sinh/${idHs}`);
  },

  // ── 8. ĐIỂM DANH BUỔI HỌC ──
  getDiemDanhBuoiHoc: async (idBuoiHoc: number): Promise<any[]> => {
    const res = await api.get(`/api/dao-tao-chung/buoi-hoc/${idBuoiHoc}/diem-danh-hoc-sinh`);
    return unwrap<any[]>(res) || [];
  },

  getDiemDanhTheoKhoaHoc: async (idKhoaHoc: number): Promise<any[]> => {
    const res = await api.get(`/api/dao-tao-chung/khoa-hoc/${idKhoaHoc}/diem-danh`);
    return unwrap<any[]>(res) || [];
  },

  luuDiemDanhBuoiHoc: async (idBuoiHoc: number, payload: { idKhoaHoc?: number; listIdHocSinh: number[] } | any): Promise<any> => {
    const res = await api.post(`/api/buoi-hoc/${idBuoiHoc}/diem-danh-hoc-sinh`, payload);
    return unwrap<any>(res);
  },

  // ── 9. HỒ SƠ HỌC SINH 360° ──
  getChiTietHocSinh: async (idHs: number): Promise<any> => {
    const res = await api.get(`/api/dao-tao-chung/hoc-sinh/${idHs}`);
    return unwrap<any>(res);
  },

  getLichSuDiemDanhHocSinh: async (idHs: number): Promise<any[]> => {
    const res = await api.get(`/api/dao-tao-chung/hoc-sinh/${idHs}/diem-danh`);
    return unwrap<any[]>(res) || [];
  },

  // ── 10. TẠO BUỔI HỌC ──
  taoBuoiHoc: async (payload: any): Promise<any> => {
    const res = await api.post('/api/giao-vien/buoi-hoc', payload);
    return unwrap<any>(res);
  }
};


