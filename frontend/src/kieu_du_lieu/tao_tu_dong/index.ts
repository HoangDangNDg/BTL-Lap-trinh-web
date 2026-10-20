export interface ApiResponse<T> {
  success?: boolean;
  statusCode?: number;
  code?: number;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
}

export * from './BaoLuuKhoaHoc';
export * from './BoMon';
export * from './BuoiHoc';
export * from './ChiNhanh';
export * from './ChiTietGv';
export * from './ChuCoDong';
export * from './ChungChiGiaoVien';
export * from './ChuyenMon';
export * from './DangKyHoc';
export * from './DiemDanhGiaoVien';
export * from './DiemDanhHocSinh';
export * from './DoanhNghiep';
export * from './GiaoVien';
export * from './GiaoVienChiNhanh';
export * from './GiaoVienChuyenMon';
export * from './GopVonSoHuu';
export * from './HocSinh';
export * from './HocSinhKhoaHoc';
export * from './KhoaHoc';
export * from './KhungLichHocCoDinh';
export * from './KyHoc';
export * from './LopHoc';
export * from './LopKyHoc';
export * from './MonHoc';
export * from './MonHocKhoaHoc';
export * from './NamHoc';
export * from './NhanCongKhac';
export * from './PhieuThuHocPhi';
export * from './PhongHoc';
export * from './PhuHuynh';
export * from './PhuHuynhHocSinh';
export * from './QuanLy';
export * from './RefreshToken';
export * from './SoQuyThuChi';
export * from './TaiKhoan';
export * from './TaiKhoanCcd';
export * from './TaiKhoanGv';
export * from './TaiKhoanQl';
export * from './ThanhToanGiaoVien';
export * from './ThoiKhoaBieuTuan';
export * from './TuanHoc';
export * from './BuoiHocDto';
export * from './KhoaHocDto';
export * from './KhungLichHocCoDinhDto';
export * from './LopHocDto';
export * from './ThoiKhoaBieuTuanDto';
export * from './LoginResponseDto';


