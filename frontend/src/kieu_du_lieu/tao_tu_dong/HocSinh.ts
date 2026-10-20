import { PhuHuynh } from './PhuHuynh';
import { DoanhNghiep } from './DoanhNghiep';

export interface HocSinh {
  idHs?: number;
  phuHuynh?: PhuHuynh;
  doanhNghiep?: DoanhNghiep;
  idDn?: number;
  idPh?: number;
  hoTen?: string;
  ngaySinh?: string;
  gioiTinh?: string;
  soDienThoai?: string;
  diaChi?: string;
  xoa?: boolean;
}


