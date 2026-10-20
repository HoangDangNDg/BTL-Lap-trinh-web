import { PhuHuynh } from './PhuHuynh';
import { HocSinh } from './HocSinh';

export interface PhuHuynhHocSinh {
  idPhHs?: number;
  phuHuynh?: PhuHuynh;
  hocSinh?: HocSinh;
  laNguoiDaiDien?: boolean;
  quanHe?: string;
  xoa?: boolean;
}


