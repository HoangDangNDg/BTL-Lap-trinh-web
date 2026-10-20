import { BoMon } from './BoMon';
import { DoanhNghiep } from './DoanhNghiep';

export interface KhoaHoc {
  idKhoaHoc?: number;
  boMon?: BoMon;
  tenKhoaHoc?: string;
  soTiet?: number;
  hocPhi?: number;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


