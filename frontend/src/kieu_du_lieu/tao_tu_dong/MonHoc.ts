import { ChuyenMon } from './ChuyenMon';
import { BoMon } from './BoMon';
import { DoanhNghiep } from './DoanhNghiep';

export interface MonHoc {
  idMh?: number;
  chuyenMon?: ChuyenMon;
  boMon?: BoMon;
  tenMon?: string;
  moTa?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


