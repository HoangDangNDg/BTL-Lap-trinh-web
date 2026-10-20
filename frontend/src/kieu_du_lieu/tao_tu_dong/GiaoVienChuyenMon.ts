import { GiaoVien } from './GiaoVien';
import { ChuyenMon } from './ChuyenMon';

export interface GiaoVienChuyenMon {
  idGvChuyenMon?: number;
  giaoVien?: GiaoVien;
  chuyenMon?: ChuyenMon;
  trangThai?: string;
  ngayCapNhat?: string;
  xoa?: boolean;
}


