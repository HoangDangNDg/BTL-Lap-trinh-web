import React, { useReducer, useEffect, useCallback } from 'react';
import { 
  X, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  CalendarPlus, 
  Layers, 
  Award, 
  BookOpen, 
  Users, 
  RefreshCw 
} from 'lucide-react';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { dichVuChuDoanhNghiepDaoTao } from '../../dich_vu/tao_tu_dong/dichVuChuDoanhNghiepDaoTao';
import { dichVuNhanSu } from '../../dich_vu/tao_tu_dong/dichVuNhanSu';
import { thongBao } from '../../tien_ich/thongBao';
import ModalWrapper from '../../thanh_phan/ModalWrapper';
import styles from './TrangBoMon.module.css';

// Import các Component Lá độc lập (Kiến trúc phân tách: TSX Logic Container + JSX View + CSS Module)
import DieuHuongPhanCapBoMon from '../../thanh_phan/quan_ly_bo_mon/DieuHuongPhanCapBoMon';
import DanhSachBoMon from '../../thanh_phan/quan_ly_bo_mon/DanhSachBoMon';
import DanhSachChuyenMon from '../../thanh_phan/quan_ly_bo_mon/DanhSachChuyenMon';
import ChiTietChuyenMon from '../../thanh_phan/quan_ly_bo_mon/ChiTietChuyenMon';

// Tái sử dụng component Danh Sách Lớp Học Đa Ngữ Cảnh
import DanhSachLopHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachLopHocView';

// Tái sử dụng đồng bộ các View phân cấp từ Quản Lý Lớp Học (TrangLopHoc)
import DanhSachKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachKhoaHocView';
import DanhSachBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachBuoiHocView';
import DanhSachHocSinhKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachHocSinhKhoaHocView';
import ChiTietHocSinhView from '../../thanh_phan/quan_ly_lop_hoc/ChiTietHocSinhView';
import TaoBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/TaoBuoiHocView';
import DiemDanhBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/DiemDanhBuoiHocView';
import TongHopDiemDanhKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/TongHopDiemDanhKhoaHocView';

// Tái sử dụng component Chi Tiết Giáo Viên theo hồ sơ 360°
import ChiTietGiaoVienModal from '../../thanh_phan/giao_vien/ChiTietGiaoVienModal';

// ── 1. KHỞI TẠO STATE & REDUCER CHO TRANG CHÍNH ──
const initialBoMonState = {
  // Ngăn xếp Queue State điều hướng phân cấp (Tầng 1: BO_MON -> Tầng 2: CHUYEN_MON -> Tầng 3: CHI_TIET_CHUYEN_MON)
  navQueue: [
    { step: 'BO_MON', data: {} }
  ],
  boMonList: [],
  loadingBoMon: true,
  refreshTrigger: 0,

  // Giáo viên được chọn để mở ChiTietGiaoVienModal
  selectedGv: null,

  // Modal Bộ Môn
  showModalBm: false,
  editingBm: null,
  tenBmInput: '',
  moTaBmInput: '',

  // Modal Chuyên Môn
  showModalCm: false,
  tenCmInput: '',
  moTaCmInput: '',

  // Modal Môn Học
  showModalMh: false,
  tenMhInput: '',
  moTaMhInput: '',

  // Modal Tạo Nhanh Lớp Học
  showModalTaoLop: false,
  formTaoLop: {
    tenLop: '',
    idBoMon: '',
    idMh: '',
    idCm: '',
    idCn: '',
    idKh: '',
    idGv: '',
    siSoToiDa: 30,
    hocPhi: 0,
    soTiet: 30
  },

  // Dữ liệu bổ trợ
  chiNhanhList: [],
  giaoVienListAll: [],

  // Toast thông báo
  toast: { loai: '', noiDung: '' }
};

function boMonReducer(state, action) {
  switch (action.type) {
    case 'SET_BO_MON_LIST':
      return { ...state, boMonList: action.payload, loadingBoMon: false };

    case 'SET_LOADING_BO_MON':
      return { ...state, loadingBoMon: action.payload };

    case 'PUSH_STEP':
      return { ...state, navQueue: [...state.navQueue, action.payload] };

    case 'POP_STEP':
      return {
        ...state,
        navQueue: state.navQueue.length > 1 ? state.navQueue.slice(0, -1) : state.navQueue
      };

    case 'JUMP_TO_STEP':
      return {
        ...state,
        navQueue: state.navQueue.slice(0, action.payload + 1)
      };

    case 'SET_SELECTED_GV':
      return { ...state, selectedGv: action.payload };

    case 'CLOSE_GV_MODAL':
      return { ...state, selectedGv: null };

    case 'TRIGGER_REFRESH':
      return { ...state, refreshTrigger: state.refreshTrigger + 1 };

    // Modal Bộ Môn
    case 'OPEN_MODAL_BM':
      return {
        ...state,
        showModalBm: true,
        editingBm: action.payload || null,
        tenBmInput: action.payload ? (action.payload.tenBm || action.payload.tenBoMon || '') : '',
        moTaBmInput: action.payload ? (action.payload.moTa || '') : ''
      };
    case 'CLOSE_MODAL_BM':
      return { ...state, showModalBm: false, editingBm: null, tenBmInput: '', moTaBmInput: '' };
    case 'SET_BM_INPUT':
      return { ...state, [action.payload.field]: action.payload.value };

    // Modal Chuyên Môn
    case 'OPEN_MODAL_CM':
      return { ...state, showModalCm: true, tenCmInput: '', moTaCmInput: '' };
    case 'CLOSE_MODAL_CM':
      return { ...state, showModalCm: false, tenCmInput: '', moTaCmInput: '' };
    case 'SET_CM_INPUT':
      return { ...state, [action.payload.field]: action.payload.value };

    // Modal Môn Học
    case 'OPEN_MODAL_MH':
      return { ...state, showModalMh: true, tenMhInput: '', moTaMhInput: '' };
    case 'CLOSE_MODAL_MH':
      return { ...state, showModalMh: false, tenMhInput: '', moTaMhInput: '' };
    case 'SET_MH_INPUT':
      return { ...state, [action.payload.field]: action.payload.value };

    // Modal Tạo Lớp Nhanh
    case 'OPEN_MODAL_TAO_LOP':
      return {
        ...state,
        showModalTaoLop: true,
        formTaoLop: {
          ...state.formTaoLop,
          ...(action.payload || {})
        }
      };
    case 'CLOSE_MODAL_TAO_LOP':
      return { ...state, showModalTaoLop: false };
    case 'UPDATE_FORM_TAO_LOP':
      return {
        ...state,
        formTaoLop: { ...state.formTaoLop, [action.payload.field]: action.payload.value }
      };

    // Dữ liệu bổ trợ
    case 'SET_CHI_NHANH_LIST':
      return { ...state, chiNhanhList: action.payload };
    case 'SET_GIAO_VIEN_LIST_ALL':
      return { ...state, giaoVienListAll: action.payload };

    // Toast
    case 'SET_TOAST':
      return { ...state, toast: action.payload };

    default:
      return state;
  }
}

/**
 * Trang Quản Lý Kiểm Soát Bộ Môn Trung Tâm (Redesigned)
 * - Quản lý bằng useReducer với ngăn xếp lịch sử phân cấp (Queue State Rollback):
 *   + Tầng 1 (BO_MON): Hiển thị danh sách các Bộ Môn của trung tâm
 *   + Tầng 2 (CHUYEN_MON): Hiển thị danh sách Chuyên Môn thuộc Bộ Môn đã chọn
 *   + Tầng 3 (CHI_TIET_CHUYEN_MON): Hiển thị Môn Học & Đội Ngũ Giáo Viên Chuyên Môn
 * - Tái sử dụng ChiTietGiaoVienModal khi click vào bất kỳ giáo viên nào
 */
const TrangBoMon = () => {
  const { user } = useTrangThaiXacThuc();
  const currentDnId = user?.idDoanhNghiep || 1;
  const { kyHocList, selectedKyHocId } = useNamHocKyHocStore();

  const [state, dispatch] = useReducer(boMonReducer, initialBoMonState);
  const {
    navQueue,
    boMonList,
    loadingBoMon,
    refreshTrigger,
    selectedGv,
    showModalBm,
    editingBm,
    tenBmInput,
    moTaBmInput,
    showModalCm,
    tenCmInput,
    moTaCmInput,
    showModalMh,
    tenMhInput,
    moTaMhInput,
    showModalTaoLop,
    formTaoLop,
    chiNhanhList,
    giaoVienListAll,
    toast
  } = state;

  // Lấy nấc hiện tại trong hàng đợi
  const currentNav = navQueue[navQueue.length - 1] || { step: 'BO_MON', data: {} };
  const currentStep = currentNav.step;
  const currentData = currentNav.data || {};

  const showToast = useCallback((loai, noiDung) => {
    if (loai === 'thanh_cong') {
      thongBao.success(noiDung);
    } else if (loai === 'canh_bao') {
      thongBao.warning(noiDung);
    } else {
      thongBao.error(noiDung);
    }
  }, []);

  // ── 2. TẢI DỮ LIỆU BAN ĐẦU (BỘ MÔN, CHI NHÁNH, GIÁO VIÊN) ──
  const fetchDanhSachBoMon = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING_BO_MON', payload: true });
      const data = await dichVuDaoTaoChung.getDanhSachBoMon(currentDnId);
      dispatch({ type: 'SET_BO_MON_LIST', payload: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.error('Lỗi khi tải bộ môn:', err);
      showToast('loi', 'Không thể tải danh sách bộ môn');
      dispatch({ type: 'SET_LOADING_BO_MON', payload: false });
    }
  }, [currentDnId, showToast]);

  const fetchBoTro = useCallback(async () => {
    try {
      const [cnRes, gvRes] = await Promise.all([
        dichVuDaoTaoChung.getDanhSachChiNhanh(currentDnId).catch(() => []),
        dichVuNhanSu.getGiaoVienTheoDoanhNghiep(currentDnId).catch(() => [])
      ]);
      const gvList = Array.isArray(gvRes) ? gvRes : (gvRes?.data || []);
      dispatch({ type: 'SET_CHI_NHANH_LIST', payload: cnRes || [] });
      dispatch({ type: 'SET_GIAO_VIEN_LIST_ALL', payload: gvList });
    } catch (err) {
      console.error('Lỗi tải danh mục bổ trợ:', err);
    }
  }, [currentDnId]);

  useEffect(() => {
    fetchDanhSachBoMon();
    fetchBoTro();
  }, [fetchDanhSachBoMon, fetchBoTro, refreshTrigger]);

  // Cập nhật chi nhánh và kỳ học mặc định cho form tạo lớp
  useEffect(() => {
    if (chiNhanhList.length > 0 && !formTaoLop.idCn) {
      dispatch({
        type: 'UPDATE_FORM_TAO_LOP',
        payload: { field: 'idCn', value: chiNhanhList[0].idCn }
      });
    }
    if (selectedKyHocId && !formTaoLop.idKh) {
      dispatch({
        type: 'UPDATE_FORM_TAO_LOP',
        payload: { field: 'idKh', value: selectedKyHocId }
      });
    }
  }, [chiNhanhList, selectedKyHocId, formTaoLop.idCn, formTaoLop.idKh]);

  // ── 3. CÁC HÀM XỬ LÝ LƯU / XÓA BỘ MÔN ──
  const handleSaveBoMon = async (e) => {
    e.preventDefault();
    if (!tenBmInput.trim()) {
      showToast('loi', 'Vui lòng nhập tên bộ môn');
      return;
    }
    try {
      if (editingBm) {
        const idBm = editingBm.idBm || editingBm.idBoMon;
        await dichVuChuDoanhNghiepDaoTao.capNhatBoMon(idBm, {
          tenBoMon: tenBmInput.trim(),
          moTa: moTaBmInput.trim()
        });
        showToast('thanh_cong', `Đã cập nhật bộ môn "${tenBmInput.trim()}" thành công!`);
      } else {
        await dichVuChuDoanhNghiepDaoTao.taoBoMon({
          tenBoMon: tenBmInput.trim(),
          moTa: moTaBmInput.trim()
        }, currentDnId);
        showToast('thanh_cong', `Đã tạo mới bộ môn "${tenBmInput.trim()}" thành công!`);
      }
      dispatch({ type: 'CLOSE_MODAL_BM' });
      fetchDanhSachBoMon();
    } catch (err) {
      console.error('Lỗi lưu bộ môn:', err);
      showToast('loi', 'Lỗi khi lưu bộ môn: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleDeleteBoMon = (idBm) => {
    thongBao.xacNhan({
      tieuDe: 'Xóa Bộ Môn',
      thongDiep: 'Bạn có chắc chắn muốn xóa bộ môn này không? Các môn học thuộc bộ môn sẽ bị ảnh hưởng.',
      loai: 'danger',
      nhanXacNhan: 'Xác nhận xóa',
      onXacNhan: async () => {
        try {
          await dichVuChuDoanhNghiepDaoTao.xoaBoMon(idBm);
          showToast('thanh_cong', 'Đã xóa bộ môn thành công!');
          fetchDanhSachBoMon();
        } catch (err) {
          console.error('Lỗi xóa bộ môn:', err);
          showToast('loi', 'Lỗi khi xóa bộ môn: ' + (err?.response?.data?.message || err.message));
        }
      }
    });
  };

  // ── 4. CÁC HÀM XỬ LÝ CHUYÊN MÔN ──
  const handleSaveChuyenMon = async (e) => {
    e.preventDefault();
    if (!tenCmInput.trim()) {
      showToast('loi', 'Vui lòng nhập tên chuyên môn');
      return;
    }
    try {
      await dichVuChuDoanhNghiepDaoTao.taoChuyenMon({
        tenCm: tenCmInput.trim(),
        moTa: moTaCmInput.trim()
      }, currentDnId);
      showToast('thanh_cong', `Đã tạo chuyên môn "${tenCmInput.trim()}" thành công!`);
      dispatch({ type: 'CLOSE_MODAL_CM' });
      dispatch({ type: 'TRIGGER_REFRESH' });
    } catch (err) {
      console.error('Lỗi tạo chuyên môn:', err);
      showToast('loi', 'Lỗi khi tạo chuyên môn: ' + (err?.response?.data?.message || err.message));
    }
  };

  // ── 5. CÁC HÀM XỬ LÝ MÔN HỌC ──
  const handleSaveMonHoc = async (e) => {
    e.preventDefault();
    if (!tenMhInput.trim()) {
      showToast('loi', 'Vui lòng nhập tên môn học');
      return;
    }
    const curBm = currentData.boMon;
    const curCm = currentData.chuyenMon;
    const idBm = curBm?.idBm || curBm?.idBoMon;
    const idCm = curCm?.idCm;

    if (!idBm || !idCm) {
      showToast('loi', 'Thiếu thông tin bộ môn hoặc chuyên môn');
      return;
    }

    try {
      await dichVuChuDoanhNghiepDaoTao.taoMonHoc({
        tenMon: tenMhInput.trim(),
        moTa: moTaMhInput.trim(),
        idBoMon: idBm,
        idChuyenMon: idCm
      }, currentDnId);
      showToast('thanh_cong', `Đã thêm môn học "${tenMhInput.trim()}" thành công!`);
      dispatch({ type: 'CLOSE_MODAL_MH' });
      dispatch({ type: 'TRIGGER_REFRESH' });
    } catch (err) {
      console.error('Lỗi tạo môn học:', err);
      showToast('loi', 'Lỗi khi tạo môn học: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleDeleteMonHoc = (idMh) => {
    thongBao.xacNhan({
      tieuDe: 'Xóa Môn Học',
      thongDiep: 'Bạn có chắc chắn muốn xóa môn học này không?',
      loai: 'danger',
      nhanXacNhan: 'Xác nhận xóa',
      onXacNhan: async () => {
        try {
          await dichVuChuDoanhNghiepDaoTao.xoaMonHoc(idMh);
          showToast('thanh_cong', 'Đã xóa môn học thành công!');
          dispatch({ type: 'TRIGGER_REFRESH' });
        } catch (err) {
          console.error('Lỗi xóa môn học:', err);
          showToast('loi', 'Lỗi khi xóa môn học: ' + (err?.response?.data?.message || err.message));
        }
      }
    });
  };

  // ── 6. TẠO NHANH LỚP HỌC THEO BỘ MÔN / CHUYÊN MÔN ──
  const handleSaveQuickClass = async (e) => {
    e.preventDefault();
    if (!formTaoLop.tenLop.trim()) {
      showToast('loi', 'Vui lòng nhập tên lớp học');
      return;
    }
    if (!formTaoLop.idCn) {
      showToast('loi', 'Vui lòng chọn cơ sở chi nhánh');
      return;
    }
    if (!formTaoLop.idKh) {
      showToast('loi', 'Vui lòng chọn kỳ học');
      return;
    }
    if (!formTaoLop.idGv) {
      showToast('loi', 'Vui lòng phân công giáo viên phụ trách');
      return;
    }

    const curBm = currentData.boMon;
    const curCm = currentData.chuyenMon;
    const idBm = curBm?.idBm || curBm?.idBoMon || formTaoLop.idBoMon;

    try {
      await dichVuChuDoanhNghiepDaoTao.taoNhanhLopTheoBoMon({
        tenLop: formTaoLop.tenLop.trim(),
        idBoMon: Number(idBm),
        idMh: formTaoLop.idMh ? Number(formTaoLop.idMh) : null,
        idCn: Number(formTaoLop.idCn),
        idKh: Number(formTaoLop.idKh),
        idGv: Number(formTaoLop.idGv),
        siSoToiDa: Number(formTaoLop.siSoToiDa) || 30,
        hocPhi: Number(formTaoLop.hocPhi) || 0,
        soTiet: Number(formTaoLop.soTiet) || 30
      }, currentDnId);

      showToast('thanh_cong', `Đã tạo thành công lớp học "${formTaoLop.tenLop.trim()}"!`);
      dispatch({ type: 'CLOSE_MODAL_TAO_LOP' });
      dispatch({ type: 'TRIGGER_REFRESH' });
    } catch (err) {
      console.error('Lỗi tạo nhanh lớp:', err);
      showToast('loi', 'Lỗi tạo lớp: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.container}>
      {/* ── TOAST THÔNG BÁO THÔNG MINH ── */}
      {toast.noiDung && (
        <div className={`${styles.toast} ${toast.loai === 'thanh_cong' ? styles.toastSuccess : styles.toastError}`}>
          {toast.loai === 'thanh_cong' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.noiDung}</span>
        </div>
      )}

      {/* ── THANH ĐIỀU HƯỚNG QUEUE STATE & BREADCRUMB ROLLBACK ── */}
      <DieuHuongPhanCapBoMon
        navQueue={navQueue}
        onPopStep={() => dispatch({ type: 'POP_STEP' })}
        onJumpToStep={(idx) => dispatch({ type: 'JUMP_TO_STEP', payload: idx })}
        onRefresh={() => dispatch({ type: 'TRIGGER_REFRESH' })}
        loading={loadingBoMon}
      />

      {/* ── TẦNG 1: DANH SÁCH BỘ MÔN TRUNG TÂM ── */}
      {currentStep === 'BO_MON' && (
        <DanhSachBoMon
          key={`bomon-root-${refreshTrigger}`}
          boMonList={boMonList}
          loading={loadingBoMon}
          onSelectBoMon={(bm) => {
            dispatch({
              type: 'PUSH_STEP',
              payload: { step: 'CHUYEN_MON', data: { boMon: bm } }
            });
          }}
          onOpenAddModal={() => dispatch({ type: 'OPEN_MODAL_BM' })}
          onOpenEditModal={(bm) => dispatch({ type: 'OPEN_MODAL_BM', payload: bm })}
          onDeleteBoMon={handleDeleteBoMon}
          onRefresh={() => dispatch({ type: 'TRIGGER_REFRESH' })}
        />
      )}

      {/* ── TẦNG 2: DANH SÁCH CHUYÊN MÔN CỦA BỘ MÔN ĐÃ CHỌN ── */}
      {currentStep === 'CHUYEN_MON' && (
        <DanhSachChuyenMon
          key={`chuyenmon-${currentData.boMon?.idBm || currentData.boMon?.idBoMon}-${refreshTrigger}`}
          boMon={currentData.boMon}
          onSelectChuyenMon={(cm) => {
            dispatch({
              type: 'PUSH_STEP',
              payload: {
                step: 'CHI_TIET_CHUYEN_MON',
                data: { boMon: currentData.boMon, chuyenMon: cm }
              }
            });
          }}
          onOpenAddChuyenMonModal={() => dispatch({ type: 'OPEN_MODAL_CM' })}
          refreshTrigger={refreshTrigger}
        />
      )}

      {/* ── TẦNG 3: CHI TIẾT CHUYÊN MÔN (MÔN HỌC & GIÁO VIÊN CHUYÊN MÔN) ── */}
      {currentStep === 'CHI_TIET_CHUYEN_MON' && (
        <ChiTietChuyenMon
          key={`detail-${currentData.boMon?.idBm || currentData.boMon?.idBoMon}-${currentData.chuyenMon?.idCm}-${refreshTrigger}`}
          boMon={currentData.boMon}
          chuyenMon={currentData.chuyenMon}
          onSelectGiaoVien={(gv) => dispatch({ type: 'SET_SELECTED_GV', payload: gv })}
          onSelectMonHoc={(mh) => {
            dispatch({
              type: 'PUSH_STEP',
              payload: {
                step: 'LOP_HOC_MON_HOC',
                data: {
                  boMon: currentData.boMon,
                  chuyenMon: currentData.chuyenMon,
                  monHoc: mh
                }
              }
            });
          }}
          onOpenAddMonHocModal={() => dispatch({ type: 'OPEN_MODAL_MH' })}
          onOpenTaoLopModal={(extra) => dispatch({ type: 'OPEN_MODAL_TAO_LOP', payload: extra })}
          onDeleteMonHoc={handleDeleteMonHoc}
          refreshTrigger={refreshTrigger}
        />
      )}

      {/* ── TẦNG 4: DANH SÁCH LỚP HỌC THEO MÔN HỌC (TÁI SỬ DỤNG DANH SÁCH LỚP HỌC VIEW) ── */}
      {currentStep === 'LOP_HOC_MON_HOC' && (
        <DanhSachLopHocView
          key={`lophoc-monhoc-${currentData.monHoc?.idMh || currentData.monHoc?.idMonHoc}-${selectedKyHocId}-${refreshTrigger}`}
          monHoc={currentData.monHoc}
          boMon={currentData.boMon}
          chuyenMon={currentData.chuyenMon}
          selectedKyHocId={selectedKyHocId}
          tenKyHoc={kyHocList.find(k => k.idKh === selectedKyHocId)?.tenKyHoc}
          onSelectLopHoc={(lop) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'KHOA_HOC',
              data: {
                ...currentData,
                lopHoc: lop
              }
            }
          })}
          onTaoBuoiHoc={(lop) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'TAO_BUOI_HOC',
              data: {
                ...currentData,
                lopHoc: lop
              }
            }
          })}
          onDiemDanh={(lop) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'DIEM_DANH',
              data: {
                ...currentData,
                lopHoc: lop
              }
            }
          })}
          onOpenTaoLopModal={(extra) => dispatch({
            type: 'OPEN_MODAL_TAO_LOP',
            payload: {
              ...extra,
              idBoMon: currentData.boMon?.idBm || currentData.boMon?.idBoMon,
              idCm: currentData.chuyenMon?.idCm,
              idMh: currentData.monHoc?.idMh || currentData.monHoc?.idMonHoc,
              tenMon: currentData.monHoc?.tenMon,
              idKh: selectedKyHocId
            }
          })}
          refreshTrigger={refreshTrigger}
        />
      )}

      {/* ── TẦNG 5: DANH SÁCH KHÓA HỌC THUỘC LỚP (TÁI SỬ DỤNG DanhSachKhoaHocView) ── */}
      {currentStep === 'KHOA_HOC' && (
        <DanhSachKhoaHocView
          key={`khoahoc-${currentData.lopHoc?.idLop}-${refreshTrigger}`}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.lopHoc?.chiNhanh}
          onSelectKhoaHoc={(kh) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'BUOI_HOC',
              data: {
                ...currentData,
                khoaHoc: kh
              }
            }
          })}
          onViewStudents={(lop, kh) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'HOC_SINH_KHOA_HOC',
              data: {
                ...currentData,
                lopHoc: lop || currentData.lopHoc,
                khoaHoc: kh || currentData.khoaHoc
              }
            }
          })}
        />
      )}

      {/* ── TẦNG 6: DANH SÁCH BUỔI HỌC CỦA LỚP / KHÓA HỌC (TÁI SỬ DỤNG DanhSachBuoiHocView) ── */}
      {currentStep === 'BUOI_HOC' && (
        <DanhSachBuoiHocView
          key={`buoihoc-${currentData.khoaHoc?.idKhoaHoc || currentData.lopHoc?.idLop}-${refreshTrigger}`}
          khoaHoc={currentData.khoaHoc}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.lopHoc?.chiNhanh}
          onTaoBuoiHoc={(lop, kh, extra) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'TAO_BUOI_HOC',
              data: {
                ...currentData,
                lopHoc: lop || currentData.lopHoc,
                khoaHoc: kh || currentData.khoaHoc,
                soThuTu: extra?.soThuTu || 1
              }
            }
          })}
          onDiemDanh={(lop, kh, buoi) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'DIEM_DANH',
              data: {
                ...currentData,
                lopHoc: lop || currentData.lopHoc,
                khoaHoc: kh || currentData.khoaHoc,
                buoiHoc: buoi
              }
            }
          })}
          onViewTeacher={(lop, kh) => {
            const gv = lop?.giaoVien || currentData.lopHoc?.giaoVien;
            if (gv) {
              dispatch({ type: 'SET_SELECTED_GV', payload: gv });
            }
          }}
          onViewStudents={(lop, kh) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'HOC_SINH_KHOA_HOC',
              data: {
                ...currentData,
                lopHoc: lop || currentData.lopHoc,
                khoaHoc: kh || currentData.khoaHoc
              }
            }
          })}
          onViewTongHopDiemDanh={(lop, kh) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'TONG_HOP_DIEM_DANH',
              data: {
                ...currentData,
                lopHoc: lop || currentData.lopHoc,
                khoaHoc: kh || currentData.khoaHoc
              }
            }
          })}
        />
      )}

      {/* ── TẦNG 7a: DANH SÁCH HỌC SINH KHÓA HỌC / LỚP HỌC (TÁI SỬ DỤNG DanhSachHocSinhKhoaHocView) ── */}
      {currentStep === 'HOC_SINH_KHOA_HOC' && (
        <DanhSachHocSinhKhoaHocView
          key={`hskh-${currentData.khoaHoc?.idKhoaHoc || currentData.lopHoc?.idLop}-${refreshTrigger}`}
          khoaHoc={currentData.khoaHoc}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.lopHoc?.chiNhanh}
          onSelectHocSinh={(hs) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'HOC_SINH_DETAIL',
              data: {
                ...currentData,
                hocSinh: hs
              }
            }
          })}
        />
      )}

      {/* ── TẦNG 7b: CHI TIẾT HỒ SƠ HỌC SINH (TÁI SỬ DỤNG ChiTietHocSinhView) ── */}
      {currentStep === 'HOC_SINH_DETAIL' && (
        <ChiTietHocSinhView
          hocSinh={currentData.hocSinh}
          onBack={() => dispatch({ type: 'POP_STEP' })}
        />
      )}

      {/* ── TẦNG 7c: TẠO BUỔI HỌC TRONG QUEUE (TÁI SỬ DỤNG TaoBuoiHocView) ── */}
      {currentStep === 'TAO_BUOI_HOC' && (
        <TaoBuoiHocView
          key={`taobuoi-${currentData.khoaHoc?.idKhoaHoc || currentData.lopHoc?.idLop}`}
          lopHoc={currentData.lopHoc}
          khoaHoc={currentData.khoaHoc}
          chiNhanh={currentData.lopHoc?.chiNhanh}
          soThuTu={currentData.soThuTu || 1}
          onTaoThanhCong={(newBuoi) => {
            dispatch({ type: 'TRIGGER_REFRESH' });
            dispatch({
              type: 'PUSH_STEP',
              payload: {
                step: 'DIEM_DANH',
                data: {
                  ...currentData,
                  buoiHoc: newBuoi
                }
              }
            });
          }}
          onBack={() => dispatch({ type: 'POP_STEP' })}
        />
      )}

      {/* ── TẦNG 7d: ĐIỂM DANH BUỔI HỌC TRONG QUEUE (TÁI SỬ DỤNG DiemDanhBuoiHocView) ── */}
      {currentStep === 'DIEM_DANH' && (
        <DiemDanhBuoiHocView
          key={`diemdanh-${currentData.buoiHoc?.idBuoiHoc || 'session'}`}
          buoiHoc={currentData.buoiHoc}
          khoaHoc={currentData.khoaHoc}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.lopHoc?.chiNhanh}
          onAttendanceSaved={() => dispatch({ type: 'TRIGGER_REFRESH' })}
          onBack={() => dispatch({ type: 'POP_STEP' })}
        />
      )}

      {/* ── TẦNG 7e: BẢNG TỔNG HỢP ĐIỂM DANH KHÓA HỌC (TÁI SỬ DỤNG TongHopDiemDanhKhoaHocView) ── */}
      {currentStep === 'TONG_HOP_DIEM_DANH' && (
        <TongHopDiemDanhKhoaHocView
          key={`tonghop-diemdanh-${currentData.khoaHoc?.idKhoaHoc || currentData.lopHoc?.idLop}-${refreshTrigger}`}
          khoaHoc={currentData.khoaHoc}
          lopHoc={currentData.lopHoc}
          chiNhanh={currentData.lopHoc?.chiNhanh}
          onDiemDanhBuoiHoc={(buoi) => dispatch({
            type: 'PUSH_STEP',
            payload: {
              step: 'DIEM_DANH',
              data: {
                ...currentData,
                buoiHoc: buoi
              }
            }
          })}
          onBack={() => dispatch({ type: 'POP_STEP' })}
        />
      )}

      {/* ── MODAL 1: CHI TIẾT GIÁO VIÊN (TÁI SỬ DỤNG HỒ SƠ 360°) ── */}
      {selectedGv && (
        <ChiTietGiaoVienModal
          giaoVien={selectedGv}
          onClose={() => dispatch({ type: 'CLOSE_GV_MODAL' })}
        />
      )}

      {/* ── MODAL 2: THÊM / SỬA BỘ MÔN ── */}
      <ModalWrapper
        isOpen={showModalBm}
        onClose={() => dispatch({ type: 'CLOSE_MODAL_BM' })}
        maxWidth="max-w-[500px]"
        title={
          <div className={styles.modalHeader}>
            <div className="droplet-circle" style={{ width: '38px', height: '38px', color: '#0284C7' }}>
              <Layers size={20} />
            </div>
            <h3 className={styles.modalTitle}>
              {editingBm ? 'Cập Nhật Bộ Môn' : 'Thêm Bộ Môn Mới'}
            </h3>
          </div>
        }
      >
        <form onSubmit={handleSaveBoMon} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên Bộ Môn <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tiếng Anh, Toán Học, Lập Trình..."
              value={tenBmInput}
              onChange={(e) => dispatch({
                type: 'SET_BM_INPUT',
                payload: { field: 'tenBmInput', value: e.target.value }
              })}
              className={styles.input}
              autoFocus
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Mô Tả Bộ Môn
            </label>
            <textarea
              placeholder="Mô tả mục tiêu, định hướng chương trình..."
              value={moTaBmInput}
              onChange={(e) => dispatch({
                type: 'SET_BM_INPUT',
                payload: { field: 'moTaBmInput', value: e.target.value }
              })}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLOSE_MODAL_BM' })}
              className={`droplet-pill ${styles.btnCancel}`}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`droplet-pill ${styles.btnSubmit}`}
            >
              {editingBm ? 'Lưu Thay Đổi' : 'Tạo Bộ Môn'}
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* ── MODAL 3: THÊM CHUYÊN MÔN MỚI ── */}
      <ModalWrapper
        isOpen={showModalCm}
        onClose={() => dispatch({ type: 'CLOSE_MODAL_CM' })}
        maxWidth="max-w-[500px]"
        title={
          <div className={styles.modalHeader}>
            <div className="droplet-circle" style={{ width: '38px', height: '38px', color: '#8B5CF6' }}>
              <Award size={20} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>
                Thêm Chuyên Môn Mới
              </h3>
              <p className={styles.modalSubtitle}>
                Bộ môn: <strong style={{ color: '#0F172A' }}>{currentData.boMon?.tenBm || currentData.boMon?.tenBoMon}</strong>
              </p>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveChuyenMon} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên Chuyên Môn <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tiếng Anh Giao Tiếp, IELTS, Toán Ôn Thi ĐH..."
              value={tenCmInput}
              onChange={(e) => dispatch({
                type: 'SET_CM_INPUT',
                payload: { field: 'tenCmInput', value: e.target.value }
              })}
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Mô Tả Chuyên Môn
            </label>
            <textarea
              placeholder="Mô tả kỹ năng, chuyên môn và yêu cầu chứng chỉ..."
              value={moTaCmInput}
              onChange={(e) => dispatch({
                type: 'SET_CM_INPUT',
                payload: { field: 'moTaCmInput', value: e.target.value }
              })}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLOSE_MODAL_CM' })}
              className={`droplet-pill ${styles.btnCancel}`}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`droplet-pill ${styles.btnSubmitPurple}`}
            >
              Tạo Chuyên Môn
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* ── MODAL 4: THÊM MÔN HỌC MỚI ── */}
      <ModalWrapper
        isOpen={showModalMh}
        onClose={() => dispatch({ type: 'CLOSE_MODAL_MH' })}
        maxWidth="max-w-[500px]"
        title={
          <div className={styles.modalHeader}>
            <div className="droplet-circle" style={{ width: '38px', height: '38px', color: '#0284C7' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>
                Thêm Môn Học Mới
              </h3>
              <span className={styles.modalSubtitle}>
                Bộ môn: {currentData.boMon?.tenBm || currentData.boMon?.tenBoMon} • Chuyên môn: {currentData.chuyenMon?.tenCm}
              </span>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveMonHoc} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên Môn Học <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Tiếng Anh 10 Nâng Cao, Luyện Thi IELTS 6.5+..."
              value={tenMhInput}
              onChange={(e) => dispatch({
                type: 'SET_MH_INPUT',
                payload: { field: 'tenMhInput', value: e.target.value }
              })}
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Mô Tả Giáo Trình Môn Học
            </label>
            <textarea
              placeholder="Mô tả nội dung chương trình, mục tiêu môn học..."
              value={moTaMhInput}
              onChange={(e) => dispatch({
                type: 'SET_MH_INPUT',
                payload: { field: 'moTaMhInput', value: e.target.value }
              })}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLOSE_MODAL_MH' })}
              className={`droplet-pill ${styles.btnCancel}`}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`droplet-pill ${styles.btnSubmit}`}
            >
              Thêm Môn Học
            </button>
          </div>
        </form>
      </ModalWrapper>

      {/* ── MODAL 5: TẠO NHANH LỚP HỌC (1-CLICK CREATOR) ── */}
      <ModalWrapper
        isOpen={showModalTaoLop}
        onClose={() => dispatch({ type: 'CLOSE_MODAL_TAO_LOP' })}
        maxWidth="max-w-[620px]"
        title={
          <div className={styles.modalHeader}>
            <div className="droplet-circle" style={{ width: '40px', height: '40px', color: '#0284C7' }}>
              <CalendarPlus size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>
                Tạo Nhanh Lớp Học
              </h3>
              <span className={styles.modalSubtitle}>
                Bộ môn: {currentData.boMon?.tenBm || currentData.boMon?.tenBoMon}
                {(currentData.monHoc?.tenMon || formTaoLop.tenMon) && ` • Môn: ${currentData.monHoc?.tenMon || formTaoLop.tenMon}`}
              </span>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveQuickClass} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Tên Lớp Học <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Lớp Tiếng Anh 10A1..."
              value={formTaoLop.tenLop}
              onChange={(e) => dispatch({
                type: 'UPDATE_FORM_TAO_LOP',
                payload: { field: 'tenLop', value: e.target.value }
              })}
              className={styles.input}
              autoFocus
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Cơ Sở Chi Nhánh <span className={styles.required}>*</span>
              </label>
              <select
                value={formTaoLop.idCn}
                onChange={(e) => dispatch({
                  type: 'UPDATE_FORM_TAO_LOP',
                  payload: { field: 'idCn', value: e.target.value }
                })}
                className={styles.select}
                required
              >
                <option value="">-- Chọn Chi Nhánh --</option>
                {(Array.isArray(chiNhanhList) ? chiNhanhList : []).map((cn) => (
                  <option key={cn.idCn} value={cn.idCn}>
                    {cn.tenCn}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Học Kỳ Áp Dụng <span className={styles.required}>*</span>
              </label>
              <select
                value={formTaoLop.idKh}
                onChange={(e) => dispatch({
                  type: 'UPDATE_FORM_TAO_LOP',
                  payload: { field: 'idKh', value: e.target.value }
                })}
                className={styles.select}
                required
              >
                <option value="">-- Chọn Kỳ Học --</option>
                {(Array.isArray(kyHocList) ? kyHocList : []).map((kh) => (
                  <option key={kh.idKh} value={kh.idKh}>
                    {kh.tenKyHoc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Giáo Viên Phụ Trách <span className={styles.required}>*</span>
            </label>
            <select
              value={formTaoLop.idGv}
              onChange={(e) => dispatch({
                type: 'UPDATE_FORM_TAO_LOP',
                payload: { field: 'idGv', value: e.target.value }
              })}
              className={styles.select}
              required
            >
              <option value="">-- Chọn Giáo Viên --</option>
              {(Array.isArray(giaoVienListAll) ? giaoVienListAll : []).map((gv) => (
                <option key={gv.idGv} value={gv.idGv}>
                  {gv.hoTen} {gv.phuHopBoMon ? '⭐ (Chuẩn bộ môn)' : ''} - {gv.soLopDangDay || 0} lớp đang dạy
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow3}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Sĩ Số Tối Đa
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formTaoLop.siSoToiDa}
                onChange={(e) => dispatch({
                  type: 'UPDATE_FORM_TAO_LOP',
                  payload: { field: 'siSoToiDa', value: e.target.value }
                })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Học Phí (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={formTaoLop.hocPhi}
                onChange={(e) => dispatch({
                  type: 'UPDATE_FORM_TAO_LOP',
                  payload: { field: 'hocPhi', value: e.target.value }
                })}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Số Tiết Học
              </label>
              <input
                type="number"
                min="1"
                value={formTaoLop.soTiet}
                onChange={(e) => dispatch({
                  type: 'UPDATE_FORM_TAO_LOP',
                  payload: { field: 'soTiet', value: e.target.value }
                })}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLOSE_MODAL_TAO_LOP' })}
              className={`droplet-pill ${styles.btnCancel}`}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`droplet-pill ${styles.btnSubmit}`}
            >
              Tạo Lớp Ngay
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
};

export default TrangBoMon;
