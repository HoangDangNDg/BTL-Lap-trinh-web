import { ChiNhanh } from './ChiNhanh';
import { DoanhNghiep } from './DoanhNghiep';

export interface SoQuyThuChi {
  idGiaoDich?: number;
  chiNhanh?: ChiNhanh;
  loaiGiaoDich?: string;
  soTien?: number;
  ngayGiaoDich?: string;
  moTa?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


