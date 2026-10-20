import { GiaoVien } from './GiaoVien';
import { ChiNhanh } from './ChiNhanh';

export interface GiaoVienChiNhanh {
  idGvChiNhanh?: number;
  giaoVien?: GiaoVien;
  chiNhanh?: ChiNhanh;
  ngayBatDau?: string;
  xoa?: boolean;
}


