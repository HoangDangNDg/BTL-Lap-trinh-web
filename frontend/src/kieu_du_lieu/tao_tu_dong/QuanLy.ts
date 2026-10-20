import { ChiNhanh } from './ChiNhanh';
import { DoanhNghiep } from './DoanhNghiep';

export interface QuanLy {
  idQly?: number;
  chiNhanh?: ChiNhanh;
  doanhNghiep?: DoanhNghiep;
  hoTen?: string;
  sdt?: string;
  email?: string;
  mucLuong?: number;
  xoa?: boolean;
}


