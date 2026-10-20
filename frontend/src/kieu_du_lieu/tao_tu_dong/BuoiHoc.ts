import { LopHoc } from './LopHoc';
import { PhongHoc } from './PhongHoc';
import { DoanhNghiep } from './DoanhNghiep';

export interface BuoiHoc {
  idBuoiHoc?: number;
  lopHoc?: LopHoc;
  phongHoc?: PhongHoc;
  ngayHoc?: string;
  caHoc?: number;
  gioBatDau?: string;
  gioKetThuc?: string;
  noiDung?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


