import api from './api';

export interface BuoiHocTaoMoiPayload {
  thoiKhoaBieuTuan: { idTkbTuan: number };
  khoaHoc: { idKhoaHoc: number };
  lopHoc: { idLop: number };
  phongHoc: { idPhong: number };
  ngayHoc: string;
  caHoc?: number;
  gioBatDau: string;
  gioKetThuc: string;
  noiDung?: string;
  doanhNghiep?: { idDn: number };
}

export interface ThoiKhoaBieuTaoMoiPayload {
  lopHoc: { idLop: number };
  tuanHoc: { idTh: number };
  phongHoc: { idPhong: number };
  giaoVien?: { idGv: number };
  thu: number;
  caHoc: number;
  gioBatDau: string;
  gioKetThuc: string;
  doanhNghiep: { idDn: number };
}

export interface DiemDanhRecordPayload {
  buoiHoc?: { idBuoiHoc: number };
  hocSinh: { idHs: number };
  trangThai: 'CO_MAT' | 'VANG_MAT' | 'CO_PHEP' | 'MUON';
  ghiChu?: string;
}

export const dichVuGiaoVien = {
  // 1. Tổng quan giảng dạy cá nhân
  getLopHocCuaToi: async () => {
    const res = await api.get('/api/giao-vien/lop-hoc');
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getLichDayCuaToi: async () => {
    const res = await api.get('/api/giao-vien/thoi-khoa-bieu');
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getBangLuongCuaToi: async () => {
    try {
      const res = await api.get('/api/giao-vien/tai-chinh/bang-luong');
      return (res as any)?.data !== undefined ? (res as any).data : res;
    } catch {
      return [];
    }
  },

  getCongDayCuaToi: async () => {
    try {
      const res = await api.get('/api/giao-vien/tai-chinh/cong-day');
      return (res as any)?.data !== undefined ? (res as any).data : res;
    } catch {
      return [];
    }
  },

  // 2. Lịch dạy tuần của doanh nghiệp
  getLichDayTuanDoanhNghiep: async (idTh: number) => {
    const res = await api.get(`/api/giao-vien/thoi-khoa-bieu/tuan/${idTh}`);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  themLichDay: async (payload: ThoiKhoaBieuTaoMoiPayload) => {
    const res = await api.post('/api/giao-vien/thoi-khoa-bieu', payload);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  xoaLichDay: async (idTkbTuan: number) => {
    const res = await api.delete(`/api/giao-vien/thoi-khoa-bieu/${idTkbTuan}`);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  // 3. Khóa học & Lớp học
  getKhoaHocCuaToi: async () => {
    const res = await api.get('/api/giao-vien/khoa-hoc');
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getLopHocTheoKy: async (idKh: number) => {
    const res = await api.get(`/api/giao-vien/ky-hoc/${idKh}/lop-hoc`);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  taoBuoiHoc: async (payload: BuoiHocTaoMoiPayload) => {
    const res = await api.post('/api/giao-vien/buoi-hoc', payload);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  // 4. Học sinh khóa học & Điểm danh
  getHocSinhKhoaHoc: async (idKhoaHoc: number) => {
    const res = await api.get(`/api/hoc-sinh-khoa-hoc/khoa-hoc/${idKhoaHoc}`);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getDiemDanhBuoiHoc: async (idBuoiHoc: number) => {
    const res = await api.get(`/api/buoi-hoc/${idBuoiHoc}/diem-danh-hoc-sinh`);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getDiemDanhTheoKhoaHoc: async (idKhoaHoc: number) => {
    const res = await api.get(`/api/khoa-hoc/${idKhoaHoc}/diem-danh-hoc-sinh`);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  luuDiemDanhBuoiHoc: async (idBuoiHoc: number, payload: { idKhoaHoc?: number; listIdHocSinh: number[] } | DiemDanhRecordPayload[] | any) => {
    const res = await api.post(`/api/buoi-hoc/${idBuoiHoc}/diem-danh-hoc-sinh`, payload);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  // 5. Danh mục tra cứu cho giáo viên
  getDanhSachTuanHoc: async () => {
    const res = await api.get('/api/giao-vien/thoi-khoa-bieu/tuan-hoc');
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getDanhSachPhongHoc: async () => {
    const res = await api.get('/api/giao-vien/thoi-khoa-bieu/phong-hoc');
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getDanhSachKyHoc: async () => {
    const res = await api.get('/api/giao-vien/ky-hoc');
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getDanhSachLopHoc: async () => {
    const res = await api.get('/api/giao-vien/thoi-khoa-bieu/lop-hoc');
    return (res as any)?.data !== undefined ? (res as any).data : res;
  },

  getDanhSachGiaoVien: async (params?: { idDn?: number }) => {
    const idDn = params?.idDn || 1;
    const res = await api.get(`/api/doanh-nghiep/${idDn}/giao-vien`);
    return (res as any)?.data !== undefined ? (res as any).data : res;
  }
};

export default dichVuGiaoVien;


