import { HocSinh } from './HocSinh';
import { LopHoc } from './LopHoc';
import { PhuHuynh } from './PhuHuynh';
import { DoanhNghiep } from './DoanhNghiep';

export interface DangKyHoc {
  idDangKy?: number;
  hocSinh?: HocSinh;
  lopHoc?: LopHoc;
  phuHuynh?: PhuHuynh;
  ngayDangKy?: string;
  trangThaiThanhToan?: boolean;
  hocPhi?: number;
  xoa?: boolean;
  doanhNghiep?: DoanhNghiep;
}


