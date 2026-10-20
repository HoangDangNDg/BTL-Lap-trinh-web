import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { dichVuNhanSu } from '../../dich_vu/tao_tu_dong/dichVuNhanSu';

// Import các component phân cấp độc lập
import DieuHuongPhanCapLopHoc from '../../thanh_phan/quan_ly_lop_hoc/DieuHuongPhanCapLopHoc';
import ChonChiNhanhView from '../../thanh_phan/quan_ly_lop_hoc/ChonChiNhanhView';
import DanhSachLopHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachLopHocView';
import DanhSachKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachKhoaHocView';
import DanhSachBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachBuoiHocView';
import DanhSachHocSinhKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachHocSinhKhoaHocView';
import ChiTietHocSinhView from '../../thanh_phan/quan_ly_lop_hoc/ChiTietHocSinhView';
import TaoBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/TaoBuoiHocView';
import DiemDanhBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/DiemDanhBuoiHocView';
import TongHopDiemDanhKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/TongHopDiemDanhKhoaHocView';

// Tái sử dụng component Chi tiết Giáo viên theo Ảnh 2
import ChiTietGiaoVienModal from '../../thanh_phan/giao_vien/ChiTietGiaoVienModal';

/**
 * Trang Quản Lý Lớp Học Trung Tâm
 * - Thiết kế phân cấp theo mô hình Queue State (Ngăn xếp điều hướng):
 *   + Tầng 1 (CHI_NHANH): Hiển thị danh sách Cơ sở Chi nhánh giống trang Chi nhánh cơ sở
 *   + Tầng 2 (LOP_HOC): Hiển thị danh sách Lớp học theo Chi nhánh & Kỳ học
 *   + Tầng 3 (KHOA_HOC): Hiển thị danh sách Khóa học thuộc lớp (Click thẻ để xem Buổi học)
 *   + Tầng 4 (BUOI_HOC): Hiển thị danh sách Buổi học, điều hướng đến Giáo viên & Danh sách Học sinh
 *   + Tầng 5a (GIAO_VIEN): Hiển thị hồ sơ Giáo viên phụ trách khóa học (Tái sử dụng component Ảnh 2)
 *   + Tầng 5b (HOC_SINH_KHOA_HOC): Quản lý Học sinh khóa học (Sĩ số giới hạn, Thêm/Xóa học sinh)
 *   + Tầng 6 (HOC_SINH_DETAIL): Chi tiết học sinh, thông tin phụ huynh và tra cứu tất cả khóa học
 * - Hỗ trợ Rollback mượt mà bằng thanh DieuHuongPhanCapLopHoc
 */
const TrangLopHoc = () => {
  const navigate = useNavigate();
  const { user } = useTrangThaiXacThuc();

  // Lấy dữ liệu năm học & kỳ học toàn cục từ Store
  const {
    namHocList,
    kyHocList,
    selectedNamHocId,
    selectedKyHocId
  } = useNamHocKyHocStore();

  const currentNam = namHocList.find(n => n.idNh === selectedNamHocId);
  const currentKy = kyHocList.find(k => k.idKh === selectedKyHocId);

  // ── 1. QUẢN LÝ DANH SÁCH CHI NHÁNH ──
  const [chiNhanhList, setChiNhanhList] = useState([]);
  const [loadingChiNhanh, setLoadingChiNhanh] = useState(false);

  const fetchBranches = useCallback(async () => {
    setLoadingChiNhanh(true);
    try {
      const res = await dichVuDaoTaoChung.getDanhSachChiNhanh();
      setChiNhanhList(res || []);
    } catch (err) {
      console.error('Lỗi khi tải chi nhánh:', err);
    } finally {
      setLoadingChiNhanh(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // ── 2. QUEUE STATE ROLLBACK ĐIỀU HƯỚNG ──
  const [navQueue, setNavQueue] = useState([
    { step: 'CHI_NHANH', data: {} }
  ]);

  const currentNav = navQueue[navQueue.length - 1] || { step: 'CHI_NHANH', data: {} };
  const currentStep = currentNav.step;
  const currentData = currentNav.data || {};

  // Thêm một bước mới vào hàng đợi
  const pushStep = (step, data) => {
    setNavQueue(prev => [...prev, { step, data }]);
  };

  // Rollback quay lại 1 bước
  const popStep = () => {
    setNavQueue(prev => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  };

  // Nhảy trực tiếp đến nấc trong hàng đợi
  const jumpToStep = (index) => {
    if (index >= 0 && index < navQueue.length) {
      setNavQueue(prev => prev.slice(0, index + 1));
    }
  };

  // ── 3. ĐIỀU HƯỚNG TẠO BUỔI HỌC & ĐIỂM DANH TRONG STACK ──
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenTaoBuoi = (lop, kh, extra) => {
    pushStep('TAO_BUOI_HOC', {
      chiNhanh: currentData.chiNhanh,
      lopHoc: lop || currentData.lopHoc,
      khoaHoc: kh || currentData.khoaHoc,
      soThuTu: extra?.soThuTu || 1
    });
  };

  const handleOpenDiemDanh = (lop, kh, buoi) => {
    pushStep('DIEM_DANH', {
      chiNhanh: currentData.chiNhanh,
      lopHoc: lop || currentData.lopHoc,
      khoaHoc: kh || currentData.khoaHoc,
      buoiHoc: buoi || null
    });
  };

  const handleModalSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // ── 4. CÁC HÀM XỬ LÝ CHUYỂN TẦNG ──
  // Tầng 1 -> Tầng 2: Chọn Chi nhánh
  const handleSelectBranch = (cn) => {
    pushStep('LOP_HOC', { chiNhanh: cn });
  };

  // Tầng 2 -> Tầng 3: Chọn Lớp học
  const handleSelectLopHoc = (lop) => {
    pushStep('KHOA_HOC', {
      chiNhanh: currentData.chiNhanh,
      lopHoc: lop
    });
  };

  // Tầng 3 -> Tầng 4: Chọn Khóa học
  const handleSelectKhoaHoc = (kh) => {
    pushStep('BUOI_HOC', {
      chiNhanh: currentData.chiNhanh,
      lopHoc: currentData.lopHoc,
      khoaHoc: kh
    });
  };

  // Tầng 4 -> Tầng 5a: Xem Giáo viên khóa học (Tái sử dụng component Ảnh 2)
  const handleViewTeacher = async (lop, kh) => {
    const targetL = lop || currentData.lopHoc;
    const targetK = kh || currentData.khoaHoc;
    let gvObj = targetL?.giaoVien || null;
    const gvId = targetL?.idGv || targetL?.idGiaoVien;

    if (!gvObj && gvId) {
      try {
        const res = await dichVuNhanSu.getGiaoVien(gvId);
        gvObj = res?.data || res;
      } catch (e) {
        console.warn('Không tải được chi tiết giáo viên:', e);
        gvObj = { idGv: gvId, hoTen: targetL?.tenGiaoVien || 'Giáo viên phụ trách' };
      }
    } else if (!gvObj && targetL?.tenGiaoVien) {
      gvObj = { idGv: targetL?.idGv || 1, hoTen: targetL?.tenGiaoVien };
    }

    pushStep('GIAO_VIEN', {
      ...currentData,
      lopHoc: targetL,
      khoaHoc: targetK,
      giaoVien: gvObj
    });
  };

  // Tầng 4 -> Tầng 5b: Xem Danh sách Học sinh khóa học
  const handleViewStudents = (lop, kh) => {
    pushStep('HOC_SINH_KHOA_HOC', {
      ...currentData,
      lopHoc: lop || currentData.lopHoc,
      khoaHoc: kh || currentData.khoaHoc
    });
  };

  // Tầng 4 -> Tầng 5e: Xem Bảng Tổng Hợp Điểm Danh Khóa Học (Matrix Điểm Danh)
  const handleViewTongHopDiemDanh = (lop, kh) => {
    pushStep('TONG_HOP_DIEM_DANH', {
      ...currentData,
      lopHoc: lop || currentData.lopHoc,
      khoaHoc: kh || currentData.khoaHoc
    });
  };

  // Tầng 5b -> Tầng 6: Xem Chi tiết Học sinh & Phụ huynh
  const handleSelectHocSinh = (hs) => {
    pushStep('HOC_SINH_DETAIL', {
      ...currentData,
      hocSinh: hs
    });
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Thanh Điều Hướng Queue State & Breadcrumb Rollback */}
      <DieuHuongPhanCapLopHoc
        navQueue={navQueue}
        onPopStep={popStep}
        onJumpToStep={jumpToStep}
        onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        extraRight={
          <button
            type="button"
            onClick={() => navigate('/bo-mon')}
            className="droplet-pill"
            style={{
              height: '38px',
              padding: '0 0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.825rem',
              fontWeight: '700',
              color: '#0284C7',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(2, 132, 199, 0.08)'
            }}
            title="Kiểm soát bộ môn trung tâm, phân công giáo viên và tạo lớp"
          >
            <Layers size={16} />
            <span>Kiểm Soát Bộ Môn</span>
          </button>
        }
      />

      {/* Tầng 1: Chọn Chi Nhánh Cơ Sở */}
      {currentStep === 'CHI_NHANH' && (
        <ChonChiNhanhView
          chiNhanhList={chiNhanhList}
          loading={loadingChiNhanh}
          onSelectBranch={handleSelectBranch}
        />
      )}

      {/* Tầng 2: Danh Sách Lớp Học Theo Chi Nhánh & Kỳ Học */}
      {currentStep === 'LOP_HOC' && (
        <DanhSachLopHocView
          key={`lophoc-${currentData.chiNhanh?.idCn}-${selectedKyHocId}-${refreshTrigger}`}
          chiNhanh={currentData.chiNhanh}
          selectedKyHocId={selectedKyHocId}
          selectedNamHocId={selectedNamHocId}
          tenKyHoc={currentKy?.tenKyHoc}
          tenNamHoc={currentNam?.tenNamHoc}
          onSelectLopHoc={handleSelectLopHoc}
          onTaoBuoiHoc={handleOpenTaoBuoi}
          onDiemDanh={handleOpenDiemDanh}
        />
      )}

      {/* Tầng 3: Danh Sách Khóa Học Thuộc Lớp (Click thẻ để xem Buổi học) */}
      {currentStep === 'KHOA_HOC' && (
        <DanhSachKhoaHocView
          key={`khoahoc-${currentData.lopHoc?.idLop}-${refreshTrigger}`}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.chiNhanh}
          onSelectKhoaHoc={handleSelectKhoaHoc}
          onViewStudents={handleViewStudents}
        />
      )}

      {/* Tầng 4: Danh Sách Buổi Học (Có 3 nút điều hướng: Giáo Viên, Học Sinh, Tổng Hợp Điểm Danh) */}
      {currentStep === 'BUOI_HOC' && (
        <DanhSachBuoiHocView
          key={`buoihoc-${currentData.khoaHoc?.idKhoaHoc || currentData.lopHoc?.idLop}-${refreshTrigger}`}
          khoaHoc={currentData.khoaHoc}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.chiNhanh}
          onTaoBuoiHoc={handleOpenTaoBuoi}
          onDiemDanh={handleOpenDiemDanh}
          onViewTeacher={handleViewTeacher}
          onViewStudents={handleViewStudents}
          onViewTongHopDiemDanh={handleViewTongHopDiemDanh}
        />
      )}

      {/* Tầng 5a: Xem Hồ Sơ Giáo Viên Khóa Học (Tái sử dụng component Ảnh 2) */}
      {currentStep === 'GIAO_VIEN' && (
        <ChiTietGiaoVienModal
          giaoVien={currentData.giaoVien}
          onClose={popStep}
        />
      )}

      {/* Tầng 5b: Xem Danh Sách Học Sinh Khóa Học (Giới hạn sĩ số, Thêm/Xóa học sinh) */}
      {currentStep === 'HOC_SINH_KHOA_HOC' && (
        <DanhSachHocSinhKhoaHocView
          key={`hskh-${currentData.khoaHoc?.idKhoaHoc}-${refreshTrigger}`}
          khoaHoc={currentData.khoaHoc}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.chiNhanh}
          onSelectHocSinh={handleSelectHocSinh}
        />
      )}

      {/* Tầng 6: Xem Chi Tiết Học Sinh & Phụ Huynh & Khóa Học Tất Cả Các Kỳ */}
      {currentStep === 'HOC_SINH_DETAIL' && (
        <ChiTietHocSinhView
          hocSinh={currentData.hocSinh}
          onBack={popStep}
        />
      )}

      {/* Tầng 5c: Tạo Buổi Học Mới trong Navigation Stack */}
      {currentStep === 'TAO_BUOI_HOC' && (
        <TaoBuoiHocView
          key={`taobuoi-${currentData.khoaHoc?.idKhoaHoc || currentData.lopHoc?.idLop}`}
          lopHoc={currentData.lopHoc}
          khoaHoc={currentData.khoaHoc}
          chiNhanh={currentData.chiNhanh}
          soThuTu={currentData.soThuTu || 1}
          onTaoThanhCong={(newBuoi) => {
            handleModalSuccess();
            pushStep('DIEM_DANH', {
              chiNhanh: currentData.chiNhanh,
              lopHoc: currentData.lopHoc,
              khoaHoc: currentData.khoaHoc,
              buoiHoc: newBuoi
            });
          }}
          onBack={popStep}
        />
      )}

      {/* Tầng 5d: Điểm Danh Buổi Học Reusable trong Navigation Stack (Hỗ trợ Rollback) */}
      {currentStep === 'DIEM_DANH' && (
        <DiemDanhBuoiHocView
          key={`diemdanh-${currentData.buoiHoc?.idBuoiHoc || 'session'}`}
          buoiHoc={currentData.buoiHoc}
          khoaHoc={currentData.khoaHoc}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.chiNhanh}
          onAttendanceSaved={handleModalSuccess}
          onBack={popStep}
        />
      )}

      {/* Tầng 5e: Bảng Tổng Hợp Điểm Danh Cả Khóa Học (Matrix Buổi học x Học sinh) */}
      {currentStep === 'TONG_HOP_DIEM_DANH' && (
        <TongHopDiemDanhKhoaHocView
          key={`tonghop-diemdanh-${currentData.khoaHoc?.idKhoaHoc || currentData.lopHoc?.idLop}-${refreshTrigger}`}
          khoaHoc={currentData.khoaHoc}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.chiNhanh}
          onDiemDanhBuoiHoc={(buoi) => handleOpenDiemDanh(currentData.lopHoc, currentData.khoaHoc, buoi)}
          onBack={popStep}
        />
      )}
    </div>
  );
};

export default TrangLopHoc;


