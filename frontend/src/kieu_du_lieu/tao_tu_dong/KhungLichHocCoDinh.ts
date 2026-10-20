import { LopHoc } from './LopHoc';
import { PhongHoc } from './PhongHoc';
import { DoanhNghiep } from './DoanhNghiep';

export interface KhungLichHocCoDinh {
  idKhungLich?: number;
  lopHoc?: LopHoc;
  phongHoc?: PhongHoc;
  thu?: number;
  caHoc?: number;
  gioBatDau?: string;
  gioKetThuc?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


