import { ChiNhanh } from './ChiNhanh';
import { DoanhNghiep } from './DoanhNghiep';

export interface NhanCongKhac {
  idNhanCongKhac?: number;
  chiNhanh?: ChiNhanh;
  hoTen?: string;
  viTriCongViec?: string;
  sdt?: string;
  email?: string;
  mucLuong?: number;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


