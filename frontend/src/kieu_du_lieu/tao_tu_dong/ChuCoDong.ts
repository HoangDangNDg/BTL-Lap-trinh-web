import { DoanhNghiep } from './DoanhNghiep';

export interface ChuCoDong {
  idCd?: number;
  doanhNghiep?: DoanhNghiep;
  hoTen?: string;
  email?: string;
  sdt?: string;
  xoa?: boolean;
}


