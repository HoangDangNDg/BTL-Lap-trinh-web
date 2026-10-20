import api from '../api';
import { ApiResponse, GiaoVien, ChiTietGv, ChungChiGiaoVien, GiaoVienChuyenMon, GiaoVienChiNhanh, NhanCongKhac } from '../../kieu_du_lieu/tao_tu_dong';

export interface GiaoVienBulkDto {
  hoTen: string;
  sdt?: string;
  email?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  trinhDo?: string;
  cccd?: number;
  diaChi?: string;
  idCn?: number;
  taoTaiKhoan?: boolean;
  matKhau?: string;
}

export interface BulkResultDto {
  tongSo: number;
  thanhCong: number;
  thatBai: number;
  danhSachLoi?: string[];
}

export const dichVuNhanSu = {

  luuGiaoVienHangLoat: async (idDn: number, danhSach: GiaoVienBulkDto[]): Promise<BulkResultDto> => {
    const response = await api.post(`/api/doanh-nghiep/${idDn}/giao-vien/hang-loat`, danhSach);
    return response as any;
  },

  getAllGiaoVien: async (): Promise<GiaoVien[]> => {
    const response = await api.get(`/api/admin/giao-vien`);
    return response as any;
  },

  getGiaoVien: async (idGv: number): Promise<GiaoVien> => {
    const response = await api.get(`/api/giao-vien/${idGv}`);
    return response as any;
  },

  getGiaoVienTheoDoanhNghiep: async (idDn: number): Promise<GiaoVien[]> => {
    const response = await api.get(`/api/doanh-nghiep/${idDn}/giao-vien`);
    return response as any;
  },

  createGiaoVien: async (idDn: number, giaoVien: GiaoVien): Promise<GiaoVien> => {
    const response = await api.post(`/api/doanh-nghiep/${idDn}/giao-vien`, giaoVien);
    return response as any;
  },

  timKiemGiaoVienTheoSdt: async (sdt: string, idDn?: number): Promise<GiaoVien[]> => {
    const response = await api.get(`/api/giao-vien/tim-kiem-sdt`, {
      params: { sdt, idDn }
    });
    return response as any;
  },

  deleteGiaoVien: async (idGv: number): Promise<void> => {
    const response = await api.delete(`/api/giao-vien/${idGv}`);
    return response as any;
  },

  createTaiKhoanGv: async (idGv: number, taiKhoan: { tenDangNhap: string; matKhau: string }): Promise<any> => {
    const response = await api.post(`/api/giao-vien/${idGv}/tai-khoan`, taiKhoan);
    return response as any;
  },

  getTaiKhoanGv: async (idGv: number): Promise<any> => {
    const response = await api.get(`/api/giao-vien/${idGv}/tai-khoan`);
    return response as any;
  },

  getChiTietGv: async (idGv: number): Promise<ChiTietGv> => {
    const response = await api.get(`/api/giao-vien/${idGv}/chi-tiet`);
    return response as any;
  },

  createChiTietGv: async (idGv: number, chiTiet: ChiTietGv): Promise<ChiTietGv> => {
    const response = await api.post(`/api/giao-vien/${idGv}/chi-tiet`, chiTiet);
    return response as any;
  },

  deleteChiTietGv: async (idGv: number): Promise<void> => {
    const response = await api.delete(`/api/giao-vien/${idGv}/chi-tiet`);
    return response as any;
  },

  getChungChiTheoGiaoVien: async (idGv: number): Promise<ChungChiGiaoVien[]> => {
    const response = await api.get(`/api/giao-vien/${idGv}/chung-chi`);
    return response as any;
  },

  createChungChi: async (idGv: number, chungChi: ChungChiGiaoVien): Promise<ChungChiGiaoVien> => {
    const response = await api.post(`/api/giao-vien/${idGv}/chung-chi`, chungChi);
    return response as any;
  },

  deleteChungChi: async (idChungChi: number): Promise<void> => {
    const response = await api.delete(`/api/chung-chi/${idChungChi}`);
    return response as any;
  },

  getChuyenMonTheoGiaoVien: async (idGv: number): Promise<GiaoVienChuyenMon[]> => {
    const response = await api.get(`/api/giao-vien/${idGv}/chuyen-mon`);
    return response as any;
  },

  getGiaoVienTheoChuyenMon: async (idCm: number): Promise<GiaoVienChuyenMon[]> => {
    const response = await api.get(`/api/chuyen-mon/${idCm}/giao-vien`);
    return response as any;
  },

  ganChuyenMon: async (idGv: number, idCm: number): Promise<GiaoVienChuyenMon> => {
    const response = await api.post(`/api/giao-vien/${idGv}/chuyen-mon/${idCm}`, {});
    return response as any;
  },

  deleteGiaoVienChuyenMon: async (idGvChuyenMon: number): Promise<void> => {
    const response = await api.delete(`/api/giao-vien-chuyen-mon/${idGvChuyenMon}`);
    return response as any;
  },

  getChiNhanhTheoGiaoVien: async (idGv: number): Promise<GiaoVienChiNhanh[]> => {
    const response = await api.get(`/api/giao-vien/${idGv}/chi-nhanh`);
    return response as any;
  },

  getGiaoVienTheoChiNhanh: async (idCn: number): Promise<GiaoVienChiNhanh[]> => {
    const response = await api.get(`/api/chi-nhanh/${idCn}/giao-vien`);
    return response as any;
  },

  ganChiNhanh: async (idGv: number, idCn: number): Promise<GiaoVienChiNhanh> => {
    const response = await api.post(`/api/giao-vien/${idGv}/chi-nhanh/${idCn}`, {});
    return response as any;
  },

  deleteGiaoVienChiNhanh: async (idGvChiNhanh: number): Promise<void> => {
    const response = await api.delete(`/api/giao-vien-chi-nhanh/${idGvChiNhanh}`);
    return response as any;
  },

  getNhanCongTheoChiNhanh: async (idCn: number): Promise<NhanCongKhac[]> => {
    const response = await api.get(`/api/chi-nhanh/${idCn}/nhan-cong`);
    return response as any;
  },

  createNhanCong: async (idCn: number, nhanCong: NhanCongKhac): Promise<NhanCongKhac> => {
    const response = await api.post(`/api/chi-nhanh/${idCn}/nhan-cong`, nhanCong);
    return response as any;
  },

  deleteNhanCong: async (idNhanCongKhac: number): Promise<void> => {
    const response = await api.delete(`/api/nhan-cong/${idNhanCongKhac}`);
    return response as any;
  }
};


