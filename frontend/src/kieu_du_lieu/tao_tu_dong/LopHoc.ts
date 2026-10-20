import { ChiNhanh } from './ChiNhanh';
import { KyHoc } from './KyHoc';
import { GiaoVien } from './GiaoVien';
import { DoanhNghiep } from './DoanhNghiep';

export interface LopHoc {
  idLop?: number;
  idKyHoc?: number;
  idKh?: number;
  idCn?: number;
  idGv?: number;
  chiNhanh?: ChiNhanh;
  kyHoc?: KyHoc;
  giaoVien?: GiaoVien;
  tenLop?: string;
  trangThai?: string;
  siSoToiDa?: number;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


