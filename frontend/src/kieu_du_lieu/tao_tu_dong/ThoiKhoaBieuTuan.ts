import { LopHoc } from './LopHoc';
import { TuanHoc } from './TuanHoc';
import { PhongHoc } from './PhongHoc';
import { GiaoVien } from './GiaoVien';
import { DoanhNghiep } from './DoanhNghiep';

export interface ThoiKhoaBieuTuan {
  idTkbTuan?: number;
  lopHoc?: LopHoc;
  tuanHoc?: TuanHoc;
  phongHoc?: PhongHoc;
  giaoVien?: GiaoVien;
  thu?: number;
  caHoc?: number;
  gioBatDau?: string;
  gioKetThuc?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


