import { KyHoc } from './KyHoc';
import { DoanhNghiep } from './DoanhNghiep';

export interface TuanHoc {
  idTh?: number;
  kyHoc?: KyHoc;
  soTuan?: number;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  moTa?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


