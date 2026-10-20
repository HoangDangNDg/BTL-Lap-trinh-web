import { DoanhNghiep } from './DoanhNghiep';

export interface NamHoc {
  idNh?: number;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  namBatDau?: number;
  namKetThuc?: number;
  tenNamHoc?: string;
  daHoanThanh?: boolean;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


