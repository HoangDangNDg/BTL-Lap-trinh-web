import { LopHoc } from './LopHoc';
import { KyHoc } from './KyHoc';
import { DoanhNghiep } from './DoanhNghiep';

export interface LopKyHoc {
  idLopKyHoc?: number;
  lopHoc?: LopHoc;
  kyHoc?: KyHoc;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


