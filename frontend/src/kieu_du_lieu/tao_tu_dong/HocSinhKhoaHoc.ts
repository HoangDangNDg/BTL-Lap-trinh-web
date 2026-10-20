import { HocSinh } from './HocSinh';
import { KhoaHoc } from './KhoaHoc';
import { DoanhNghiep } from './DoanhNghiep';

export interface HocSinhKhoaHoc {
  idHsKh?: number;
  hocSinh?: HocSinh;
  khoaHoc?: KhoaHoc;
  doanhNghiep?: DoanhNghiep;
  idHs?: number;
  idKhoaHoc?: number;
  idDn?: number;
  hoTen?: string;
  tenHocSinh?: string;
  soBuoiDaHoc?: number;
  ngayDangKy?: string;
  trangThai?: boolean;
  xoa?: boolean;
}


