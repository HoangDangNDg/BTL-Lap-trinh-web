import { ChiNhanh } from './ChiNhanh';
import { DoanhNghiep } from './DoanhNghiep';

export interface PhongHoc {
  idPhong?: number;
  chiNhanh?: ChiNhanh;
  tenPhong?: string;
  sucChua?: number;
  loaiPhong?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


