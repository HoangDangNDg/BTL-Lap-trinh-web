import { GiaoVien } from './GiaoVien';

export interface ChiTietGv {
  idChiTietGv?: number;
  giaoVien?: GiaoVien;
  cccd?: number;
  urlAnh?: string;
  sdtNguoiThan?: string;
  tenNguoiThan?: string;
  diaChi?: string;
  trinhDo?: string;
  ngayVaoLam?: string;
  xoa?: boolean;
  trangThaiHoatDong?: boolean;
}


