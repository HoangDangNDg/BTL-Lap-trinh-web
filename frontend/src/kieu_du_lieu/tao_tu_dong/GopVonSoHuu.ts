import { DoanhNghiep } from './DoanhNghiep';
import { ChuCoDong } from './ChuCoDong';

export interface GopVonSoHuu {
  idGopVon?: number;
  doanhNghiep?: DoanhNghiep;
  chuCoDong?: ChuCoDong;
  ngayGop?: string;
  soTienGop?: number;
  xoa?: boolean;
}


