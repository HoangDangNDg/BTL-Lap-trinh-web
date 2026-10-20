import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DangNhap from './trang/DangNhap';
import BoCucChinh from './bo_cuc/BoCucChinh';
import BangDieuKhien from './trang/BangDieuKhien';

// Nhóm 1: Doanh nghiệp & Chi nhánh (Lazy loaded chunks)
const TrangDoanhNghiep = lazy(() => import('./trang/quan_ly_doanh_nghiep/TrangDoanhNghiep'));
const TrangChiNhanh = lazy(() => import('./trang/quan_ly_doanh_nghiep/TrangChiNhanh'));
const TrangChuCoDong = lazy(() => import('./trang/quan_ly_doanh_nghiep/TrangChuCoDong'));

// Nhóm 2: Nhân sự & Giảng viên (Lazy loaded chunks)
const TrangGiaoVien = lazy(() => import('./trang/quan_ly_nhan_su/TrangGiaoVien'));
const TrangNhanCongKhac = lazy(() => import('./trang/quan_ly_nhan_su/TrangNhanCongKhac'));
const TrangThoiKhoaBieuGiaoVien = lazy(() => import('./trang/quan_ly_nhan_su/TrangThoiKhoaBieuGiaoVien'));

// Nhóm 3: Đào tạo & Khóa học (Lazy loaded chunks)
const TrangNamHoc = lazy(() => import('./trang/quan_ly_dao_tao/TrangNamHoc'));
const TrangBoMon = lazy(() => import('./trang/quan_ly_dao_tao/TrangBoMon'));
const TrangLopHoc = lazy(() => import('./trang/quan_ly_dao_tao/TrangLopHoc'));
const TrangThoiKhoaBieu = lazy(() => import('./trang/quan_ly_dao_tao/TrangThoiKhoaBieu'));
const TrangDiemDanh = lazy(() => import('./trang/quan_ly_dao_tao/TrangDiemDanh'));

// Nhóm 4: Học sinh & Phụ huynh (Lazy loaded chunks)
const TrangHocSinh = lazy(() => import('./trang/quan_ly_hoc_sinh/TrangHocSinh'));
const TrangPhuHuynh = lazy(() => import('./trang/quan_ly_hoc_sinh/TrangPhuHuynh'));
const TrangDangKyHoc = lazy(() => import('./trang/quan_ly_hoc_sinh/TrangDangKyHoc'));

// Nhóm 5: Tài chính (Lazy loaded chunks)
const TrangPhieuThuHocPhi = lazy(() => import('./trang/quan_ly_tai_chinh/TrangPhieuThuHocPhi'));
const TrangGiaoDichThuPhiHocSinh = lazy(() => import('./trang/quan_ly_tai_chinh/TrangGiaoDichThuPhiHocSinh'));
const TrangLuongGiaoVien = lazy(() => import('./trang/quan_ly_tai_chinh/TrangLuongGiaoVien'));
const TrangSoQuyThuChi = lazy(() => import('./trang/quan_ly_tai_chinh/TrangSoQuyThuChi'));

import { dichVuXacThuc } from './dich_vu/dichVuXacThuc';
import { useTrangThaiXacThuc } from './trang_thai/useTrangThaiXacThuc';
import DemoOne from './components/ui/demo';
import RanhGioiLoi from './thanh_phan/RanhGioiLoi';
import TrangBaoLoi from './thanh_phan/TrangBaoLoi';

function UngDung() {
  const { login } = useTrangThaiXacThuc();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (dichVuXacThuc.isAuthenticated()) {
        try {
          const data = await dichVuXacThuc.refresh();
          if (data) {
            login(data);
          }
        } catch (e) {
          console.error('Session restore failed', e);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, [login]);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải hệ thống...</div>;
  }

  return (
    <BrowserRouter>
      <RanhGioiLoi fullPage={true}>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold">Đang tải màn hình...</span>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/login" element={<DangNhap />} />
            
            <Route path="/" element={<BoCucChinh />}>
              <Route index element={<BangDieuKhien />} />
              
              {/* Nhóm 1: Doanh nghiệp */}
              <Route path="doanh-nghiep" element={<TrangDoanhNghiep />} />
              <Route path="chi-nhanh" element={<TrangChiNhanh />} />
              <Route path="chu-co-dong" element={<TrangChuCoDong />} />
              
              {/* Nhóm 2: Nhân sự */}
              <Route path="giao-vien" element={<TrangGiaoVien />} />
              <Route path="giao-vien/:idGv/thoi-khoa-bieu" element={<TrangThoiKhoaBieuGiaoVien />} />
              <Route path="giao-vien/thoi-khoa-bieu" element={<TrangThoiKhoaBieuGiaoVien />} />
              <Route path="nhan-cong" element={<TrangNhanCongKhac />} />
              
              {/* Nhóm 3: Đào tạo */}
              <Route path="nam-hoc" element={<TrangNamHoc />} />
              <Route path="bo-mon" element={<TrangBoMon />} />
              <Route path="thoi-khoa-bieu" element={<TrangThoiKhoaBieu />} />
              <Route path="khoa-hoc" element={<Navigate to="/bo-mon" replace />} />
              <Route path="lop-hoc" element={<TrangLopHoc />} />
              <Route path="lich-hoc" element={<Navigate to="/lop-hoc" replace />} />
              <Route path="diem-danh" element={<TrangDiemDanh />} />
              
              {/* Nhóm 4: Học sinh */}
              <Route path="hoc-sinh" element={<TrangHocSinh />} />
              <Route path="phu-huynh" element={<TrangPhuHuynh />} />
              <Route path="dang-ky-hoc" element={<TrangDangKyHoc />} />
              
              {/* Nhóm 5: Tài chính */}
              <Route path="phieu-thu" element={<TrangPhieuThuHocPhi />} />
              <Route path="phieu-thu/giao-dich" element={<TrangGiaoDichThuPhiHocSinh />} />
              <Route path="luong-giao-vien" element={<TrangLuongGiaoVien />} />
              <Route path="thu-chi" element={<TrangSoQuyThuChi />} />
              {/* Demo Button Showcase */}
              <Route path="demo-buttons" element={<DemoOne />} />
            </Route>
            
            {/* Bắt tất cả đường dẫn không tồn tại ➔ Hiển thị TrangBaoLoi 404 thân thiện */}
            <Route path="*" element={
              <TrangBaoLoi 
                fullPage={true} 
                loi={404} 
                tieuDe="Không tìm thấy trang" 
                thongDiep="Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được chuyển sang địa chỉ mới."
              />
            } />
          </Routes>
        </Suspense>
      </RanhGioiLoi>
    </BrowserRouter>
  );
}

export default UngDung;



