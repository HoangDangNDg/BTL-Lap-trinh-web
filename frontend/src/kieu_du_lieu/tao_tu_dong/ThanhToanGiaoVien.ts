import { GiaoVien } from './GiaoVien';
import { DoanhNghiep } from './DoanhNghiep';

export interface ThanhToanGiaoVien {
  idThanhToan?: number;
  giaoVien?: GiaoVien;
  doanhNghiep?: DoanhNghiep;
  soTien?: number;
  ngayThanhToan?: string;
  xoa?: boolean;
}


