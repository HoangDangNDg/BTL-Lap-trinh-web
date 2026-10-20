import { DoanhNghiep } from './DoanhNghiep';

export interface PhuHuynh {
  idPh?: number;
  doanhNghiep?: DoanhNghiep;
  hoTen?: string;
  sdt?: string;
  email?: string;
  xoa?: boolean;
}


