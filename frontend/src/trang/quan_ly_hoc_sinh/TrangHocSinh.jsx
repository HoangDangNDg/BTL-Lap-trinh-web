import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';

// Import các component phân tách
import DieuHuongPhanCapHocSinh from '../../thanh_phan/quan_ly_hoc_sinh/DieuHuongPhanCapHocSinh';
import TimKiemHocSinh from '../../thanh_phan/quan_ly_hoc_sinh/TimKiemHocSinh';
import ModalThemSuaHocSinh from '../../thanh_phan/quan_ly_hoc_sinh/ModalThemSuaHocSinh';
import ChiTietHocSinhView from '../../thanh_phan/quan_ly_lop_hoc/ChiTietHocSinhView';

/**
 * Trang Quản Lý Hồ Sơ Học Sinh
 * - Tái cấu trúc theo cơ chế Queue State điều hướng & Rollback
 * - Tái sử dụng trực tiếp ChiTietHocSinhView khi click vào học sinh
 * - 2 ô tìm kiếm độc lập theo CCCD và SĐT (không hiển thị danh sách ban đầu)
 * - Nút "+ Thêm Học Sinh Mới" chuẩn phong cách giao diện
 */
const TrangHocSinh = () => {
  const { user } = useTrangThaiXacThuc();
  const [selectedDnId, setSelectedDnId] = useState(user?.idDoanhNghiep || 1);
  const [doanhNghieps, setDoanhNghieps] = useState([]);

  // ── 1. QUEUE STATE ROLLBACK ĐIỀU HƯỚNG ──
  // Hàng đợi điều hướng: 'TIM_KIEM' (Gốc) -> 'CHI_TIET' (Hồ sơ học sinh)
  const [navQueue, setNavQueue] = useState([
    { step: 'TIM_KIEM', data: {} }
  ]);

  const currentNav = navQueue[navQueue.length - 1] || { step: 'TIM_KIEM', data: {} };
  const currentStep = currentNav.step;
  const currentData = currentNav.data || {};

  const pushStep = (step, data) => {
    setNavQueue(prev => [...prev, { step, data }]);
  };

  const popStep = () => {
    setNavQueue(prev => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  };

  const jumpToStep = (index) => {
    if (index >= 0 && index < navQueue.length) {
      setNavQueue(prev => prev.slice(0, index + 1));
    }
  };

  // ── 2. STATE TÌM KIẾM HỌC SINH ──
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState(null); // 'CCCD' | 'SDT' | null
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Thông báo alert toàn cục
  const [successMessage, setSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');

  // ── 3. MODAL THÊM / SỬA HỌC SINH ──
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Tải danh sách Doanh Nghiệp
  useEffect(() => {
    if (user?.idDoanhNghiep && user?.vaiTro !== 'ADMIN') {
      setSelectedDnId(user.idDoanhNghiep);
      dichVuDoanhNghiep.getDoanhNghiep(user.idDoanhNghiep)
        .then(res => {
          const dn = res?.data || res;
          if (dn) setDoanhNghieps([dn]);
        })
        .catch(err => console.error("Lỗi khi tải thông tin doanh nghiệp:", err));
    } else {
      dichVuDoanhNghiep.getAllDoanhNghiep()
        .then(res => {
          const list = Array.isArray(res) ? res : (res?.data || []);
          setDoanhNghieps(list);
        })
        .catch(err => console.error("Lỗi khi tải danh sách doanh nghiệp:", err));
    }
  }, [user]);

  const currentDn = useMemo(() => {
    return doanhNghieps.find(dn => dn.idDn === selectedDnId) || { idDn: selectedDnId, tenDn: `Doanh Nghiệp #${selectedDnId}` };
  }, [doanhNghieps, selectedDnId]);

  // ── 4. XỬ LÝ TÌM KIẾM THEO CCCD ──
  const handleSearchCccd = async (cccd) => {
    if (!cccd) return;
    try {
      setSearchLoading(true);
      setSearchError('');
      setSearchType('CCCD');
      setSearchKeyword(cccd);

      const res = await dichVuHocSinhPhuHuynh.timHocSinhTheoCccd(cccd);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSearchResults(list);
    } catch (err) {
      console.error('Lỗi khi tra cứu học sinh theo CCCD:', err);
      setSearchError('Không thể tra cứu theo số CCCD này. Vui lòng kiểm tra lại kết nối.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // ── 5. XỬ LÝ TÌM KIẾM THEO SĐT ──
  const handleSearchSdt = async (sdt) => {
    if (!sdt) return;
    try {
      setSearchLoading(true);
      setSearchError('');
      setSearchType('SDT');
      setSearchKeyword(sdt);

      const res = await dichVuHocSinhPhuHuynh.timHocSinhTheoSdt(sdt);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSearchResults(list);
    } catch (err) {
      console.error('Lỗi khi tra cứu học sinh theo SĐT:', err);
      setSearchError('Không thể tra cứu theo số điện thoại này. Vui lòng kiểm tra lại kết nối.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Đặt lại kết quả tìm kiếm
  const handleResetSearch = () => {
    setSearchResults([]);
    setSearchType(null);
    setSearchKeyword('');
    setSearchError('');
  };

  // ── 6. CHUYỂN TẦNG: CLICK VÀO HỌC SINH ĐỂ XEM CHI TIẾT ──
  const handleSelectStudent = (hs) => {
    pushStep('CHI_TIET', { hocSinh: hs });
  };

  // ── 7. MỞ MODAL THÊM MỚI ──
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  // ── 8. MỞ MODAL CHỈNH SỬA ──
  const handleOpenEditModal = (hs) => {
    setEditingStudent(hs);
    setShowModal(true);
  };

  // ── 9. XỬ LÝ LƯU THÀNH CÔNG TỪ MODAL ──
  const handleModalSuccess = (savedStudent) => {
    setSuccessMessage(`Đã lưu thành công hồ sơ học sinh "${savedStudent.hoTen}"`);
    setTimeout(() => setSuccessMessage(''), 4000);

    // Cập nhật kết quả tìm kiếm nếu học sinh nằm trong danh sách
    setSearchResults(prev => {
      const idx = prev.findIndex(item => item.idHs === savedStudent.idHs);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...savedStudent };
        return next;
      }
      return [savedStudent, ...prev];
    });

    // Nếu đang đứng ở tầng CHI_TIET của học sinh đó, cập nhật dữ liệu trong Queue State
    if (currentStep === 'CHI_TIET' && currentData?.hocSinh?.idHs === savedStudent.idHs) {
      setNavQueue(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          step: 'CHI_TIET',
          data: { ...currentData, hocSinh: savedStudent }
        };
        return next;
      });
    }
  };

  // ── 10. ĐỔI TRẠNG THÁI / XÓA MỀM HỌC SINH ──
  const handleToggleDelete = async (hs) => {
    const isDeleting = !hs.xoa;
    const confirmText = isDeleting
      ? `Bạn có chắc muốn đánh dấu học sinh "${hs.hoTen}" là đã nghỉ học?`
      : `Khôi phục trạng thái đang học cho "${hs.hoTen}"?`;

    if (!window.confirm(confirmText)) return;

    try {
      if (isDeleting) {
        await dichVuHocSinhPhuHuynh.deleteHocSinh(hs.idHs);
        setSuccessMessage(`Đã chuyển học sinh "${hs.hoTen}" sang trạng thái nghỉ học`);
      } else {
        await dichVuHocSinhPhuHuynh.updateHocSinh(hs.idHs, { xoa: false });
        setSuccessMessage(`Đã khôi phục học sinh "${hs.hoTen}" đang theo học`);
      }

      // Cập nhật trạng thái trong searchResults
      setSearchResults(prev => prev.map(item => item.idHs === hs.idHs ? { ...item, xoa: isDeleting } : item));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái học sinh:', err);
      setGeneralError('Không thể thay đổi trạng thái học sinh.');
      setTimeout(() => setGeneralError(''), 3000);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ── BREADCRUMB ĐIỀU HƯỚNG PHÂN CẤP & ROLLBACK ── */}
      <DieuHuongPhanCapHocSinh
        navQueue={navQueue}
        onPopStep={popStep}
        onJumpToStep={jumpToStep}
        onRefresh={() => {
          if (searchType === 'CCCD') handleSearchCccd(searchKeyword);
          else if (searchType === 'SDT') handleSearchSdt(searchKeyword);
        }}
        loading={searchLoading}
      />

      {/* ── THÔNG BÁO ALERT (NẾU CÓ) ── */}
      {successMessage && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '14px',
          color: '#065F46',
          fontSize: '0.875rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {generalError && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '14px',
          color: '#B91C1C',
          fontSize: '0.875rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      {/* ── TẦNG 1: TRA CỨU HỒ SƠ HỌC SINH (2 Ô TÌM KIẾM & NÚT THÊM HỌC SINH MỚI) ── */}
      {currentStep === 'TIM_KIEM' && (
        <TimKiemHocSinh
          user={user}
          selectedDnId={selectedDnId}
          onChangeDnId={setSelectedDnId}
          currentDn={currentDn}
          searchResults={searchResults}
          searchType={searchType}
          searchKeyword={searchKeyword}
          loading={searchLoading}
          errorMessage={searchError}
          onSearchCccd={handleSearchCccd}
          onSearchSdt={handleSearchSdt}
          onResetSearch={handleResetSearch}
          onSelectStudent={handleSelectStudent}
          onOpenAddModal={handleOpenAddModal}
          onOpenEditModal={handleOpenEditModal}
          onToggleDelete={handleToggleDelete}
        />
      )}

      {/* ── TẦNG 2: CHI TIẾT HỌC SINH (TÁI SỬ DỤNG COMPONENT ChiTietHocSinhView) ── */}
      {currentStep === 'CHI_TIET' && currentData?.hocSinh && (
        <ChiTietHocSinhView
          hocSinh={currentData.hocSinh}
          onBack={popStep}
          onEdit={handleOpenEditModal}
          onSelectStudent={handleSelectStudent}
        />
      )}

      {/* ── MODAL THÊM / SỬA HỌC SINH (DÙNG CHUNG CHO CẢ TẦNG TÌM KIẾM VÀ TẦNG CHI TIẾT) ── */}
      <ModalThemSuaHocSinh
        show={showModal}
        onClose={() => setShowModal(false)}
        editingStudent={editingStudent}
        selectedDnId={selectedDnId}
        currentDn={currentDn}
        onSuccess={handleModalSuccess}
      />

    </div>
  );
};

export default TrangHocSinh;


