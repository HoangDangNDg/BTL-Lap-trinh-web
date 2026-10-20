import { DoanhNghiep } from './DoanhNghiep';

export interface GiaoVien {
  idGv?: number;
  doanhNghiep?: DoanhNghiep;
  hoTen?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  sdt?: string;
  email?: string;
  conHoatDong?: boolean;
  xoa?: boolean;
}


