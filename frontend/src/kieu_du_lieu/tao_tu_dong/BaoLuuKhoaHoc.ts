import { HocSinh } from './HocSinh';
import { LopHoc } from './LopHoc';
import { DangKyHoc } from './DangKyHoc';
import { DoanhNghiep } from './DoanhNghiep';

export interface BaoLuuKhoaHoc {
  idBaoLuu?: number;
  hocSinh?: HocSinh;
  lopHoc?: LopHoc;
  dangKyHoc?: DangKyHoc;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  trangThaiBaoLuu?: boolean;
  ngayHoanTra?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


