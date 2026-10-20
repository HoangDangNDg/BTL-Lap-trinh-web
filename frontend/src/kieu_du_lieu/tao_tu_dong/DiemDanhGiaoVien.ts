import { BuoiHoc } from './BuoiHoc';
import { GiaoVien } from './GiaoVien';
import { DoanhNghiep } from './DoanhNghiep';

export interface DiemDanhGiaoVien {
  idDiemDanh?: number;
  buoiHoc?: BuoiHoc;
  giaoVien?: GiaoVien;
  trangThai?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


