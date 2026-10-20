export interface TaiKhoan {
  idTk?: number;
  tenDangNhap: string;
  matKhau: string;
  trangThai?: string;
  idTaiKhoanVaiTro?: number;
  xoa?: boolean;
}

export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  idTk?: number;
  tenDangNhap?: string;
  hoTen?: string;
  vaiTro?: string;
  idDoiTuong?: number;
  idDoanhNghiep?: number;
  idChiNhanh?: number;
  quyenHan?: string[];
}

export interface ApiResponse<T> {
  success?: boolean;
  statusCode?: number;
  code?: number;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
}


