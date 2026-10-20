import api from './api';
import { ApiResponse } from '../kieu_du_lieu/xac_thuc';
import { TuanHoc } from '../kieu_du_lieu/tao_tu_dong/TuanHoc';
import { ThoiKhoaBieuTuan } from '../kieu_du_lieu/tao_tu_dong/ThoiKhoaBieuTuan';

export interface ThoiKhoaBieuTuanDto {
  idTkbTuan?: number;
  idLop?: number;
  tenLop?: string;
  tenKhoaHoc?: string;
  tenChiNhanh?: string;
  idTh?: number;
  soTuan?: number;
  moTaTuan?: string;
  idPhong?: number;
  tenPhong?: string;
  idGiaoVien?: number;
  tenGiaoVien?: string;
  thu?: number;
  caHoc?: number;
  gioBatDau?: string;
  gioKetThuc?: string;
}

export const dichVuThoiKhoaBieu = {
  // Lấy danh sách tuần học (dùng chung cho cả 4 vai trò)
  getDanhSachTuanHoc: async (_isOwner?: boolean): Promise<TuanHoc[]> => {
    const response = await api.get<never, ApiResponse<TuanHoc[]>>('/api/dao-tao-chung/tuan-hoc');
    return response.data || [];
  },

  // Lấy thời khóa biểu theo id tuần (dùng chung cho cả 4 vai trò)
  getThoiKhoaBieuTheoTuan: async (idTh: number, _isOwner?: boolean): Promise<ThoiKhoaBieuTuanDto[]> => {
    const response = await api.get<never, ApiResponse<ThoiKhoaBieuTuanDto[]>>(`/api/dao-tao-chung/thoi-khoa-bieu/tuan/${idTh}`);
    return response.data || [];
  },

  // Lấy toàn bộ thời khóa biểu của doanh nghiệp (dùng chung cho cả 4 vai trò)
  getAllThoiKhoaBieuDoanhNghiep: async (): Promise<ThoiKhoaBieuTuanDto[]> => {
    const response = await api.get<never, ApiResponse<ThoiKhoaBieuTuanDto[]>>('/api/dao-tao-chung/thoi-khoa-bieu/all');
    return response.data || [];
  },

  // Lấy thời khóa biểu theo giáo viên (và tuần nếu có)
  getThoiKhoaBieuTheoGiaoVien: async (idGv: number, idTh?: number): Promise<ThoiKhoaBieuTuanDto[]> => {
    const qs = idTh ? `?idTh=${idTh}` : '';
    const response = await api.get<never, ApiResponse<ThoiKhoaBieuTuanDto[]>>(`/api/dao-tao-chung/thoi-khoa-bieu/giao-vien/${idGv}${qs}`);
    return response.data || [];
  },

  // Thêm mới / cập nhật thời khóa biểu
  saveThoiKhoaBieu: async (tkb: any): Promise<ThoiKhoaBieuTuanDto> => {
    const response = await api.post<never, ApiResponse<ThoiKhoaBieuTuanDto>>('/api/admin/dao-tao/thoi-khoa-bieu', tkb);
    return response.data;
  },

  // Xóa thời khóa biểu
  deleteThoiKhoaBieu: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/dao-tao/thoi-khoa-bieu/${id}`);
  }
};

