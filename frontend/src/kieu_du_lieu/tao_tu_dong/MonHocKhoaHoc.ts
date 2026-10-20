import { MonHoc } from './MonHoc';
import { KhoaHoc } from './KhoaHoc';
import { DoanhNghiep } from './DoanhNghiep';

export interface MonHocKhoaHoc {
  idMhKh?: number;
  monHoc?: MonHoc;
  khoaHoc?: KhoaHoc;
  trangThai?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


