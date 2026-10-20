import { GiaoVien } from './GiaoVien';
import { DoanhNghiep } from './DoanhNghiep';

export interface ChungChiGiaoVien {
  idChungChi?: number;
  giaoVien?: GiaoVien;
  tenChungChi?: string;
  ngayCap?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


