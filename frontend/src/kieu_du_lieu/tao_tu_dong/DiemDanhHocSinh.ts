import { BuoiHoc } from './BuoiHoc';
import { HocSinh } from './HocSinh';
import { DoanhNghiep } from './DoanhNghiep';

export interface DiemDanhHocSinh {
  idDiemDanh?: number;
  buoiHoc?: BuoiHoc;
  hocSinh?: HocSinh;
  trangThai?: boolean; // true/1 = Đi học (Có mặt), false/0 = Vắng mặt
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}

export interface DiemDanhHocSinhRequest {
  idKhoaHoc?: number;
  listIdHocSinh: number[]; // Danh sách ID các học sinh có mặt / đi học
}


