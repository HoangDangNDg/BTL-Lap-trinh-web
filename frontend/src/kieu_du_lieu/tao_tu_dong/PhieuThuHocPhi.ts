import { DangKyHoc } from './DangKyHoc';
import { HocSinh } from './HocSinh';
import { DoanhNghiep } from './DoanhNghiep';

export interface PhieuThuHocPhi {
  idPhieuThu?: number;
  dangKyHoc?: DangKyHoc;
  hocSinh?: HocSinh;
  soTienThu?: number;
  ngayThu?: string;
  phuongThuc?: string;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


