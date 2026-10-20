import { NamHoc } from './NamHoc';
import { DoanhNghiep } from './DoanhNghiep';

export interface KyHoc {
  idKh?: number;
  namHoc?: NamHoc;
  tenKyHoc?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


