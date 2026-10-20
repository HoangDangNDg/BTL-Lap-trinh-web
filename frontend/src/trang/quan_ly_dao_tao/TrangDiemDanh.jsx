import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileCheck, 
  RefreshCw, 
  ArrowLeft, 
  ExternalLink, 
  GraduationCap, 
  AlertCircle
} from 'lucide-react';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import ThanhChonPhanCapDaoTao from '../../thanh_phan/dao_tao/ThanhChonPhanCapDaoTao';
import TongHopDiemDanhKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/TongHopDiemDanhKhoaHocView';
import DiemDanhBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/DiemDanhBuoiHocView';
import ChiTietHocSinhView from '../../thanh_phan/quan_ly_lop_hoc/ChiTietHocSinhView';
import TrangBaoLoi from '../../thanh_phan/TrangBaoLoi';
import styles from './TrangDiemDanh.module.css';

// ── 1. ĐỊNH NGHĨA TIẾN TRÌNH 4 BƯỚC PHÂN CẤP & CÁC CHẾ ĐỘ HIỂN THỊ (VIEW MODES) ──
export const TIEN_TRINH_DIEM_DANH = {
  BUOC_1_CHI_NHANH: 1, // Chọn Chi nhánh
  BUOC_2_LOP_HOC: 2,   // Chọn Lớp học chi nhánh trong kỳ học
  BUOC_3_KHOA_HOC: 3,  // Chọn Khóa học thuộc lớp học (có bộ lọc chuyên môn)
  BUOC_4_DIEM_DANH: 4  // Ma trận tổng hợp điểm danh khóa học
};

export const VIEW_MODES = {
  MAIN: 'MAIN',                    // Giao diện chính: Tiến trình phân cấp + Ma trận điểm danh
  STUDENT_DETAIL: 'STUDENT_DETAIL', // Màn hình xem chi tiết hồ sơ học sinh
  BUOI_HOC: 'BUOI_HOC'             // Màn hình điểm danh 1 buổi học
};

// ── 2. ACTIONS CỦA USEREDUCER ──
const ACTIONS = {
  SET_LOADING_INIT: 'SET_LOADING_INIT',
  SET_CHI_NHANH_LIST: 'SET_CHI_NHANH_LIST',
  CHON_CHI_NHANH: 'CHON_CHI_NHANH',

  // Tầng 2: Kỳ học, Bộ môn & Lớp học
  SET_KY_HOC_LIST: 'SET_KY_HOC_LIST',
  CHON_KY_HOC: 'CHON_KY_HOC',
  SET_BO_MON_LIST: 'SET_BO_MON_LIST',
  CHON_BO_MON: 'CHON_BO_MON',
  SET_LOADING_LOP: 'SET_LOADING_LOP',
  SET_LOP_HOC_LIST: 'SET_LOP_HOC_LIST',
  SET_TAB_LOP_TRANG_THAI: 'SET_TAB_LOP_TRANG_THAI',
  CHON_LOP_HOC: 'CHON_LOP_HOC',
  SET_SEARCH_LOP_KW: 'SET_SEARCH_LOP_KW',

  // Tầng 3: Khóa học thuộc lớp
  SET_LOADING_KHOA_HOC: 'SET_LOADING_KHOA_HOC',
  SET_KHOA_HOC_LIST: 'SET_KHOA_HOC_LIST',
  CHON_KHOA_HOC: 'CHON_KHOA_HOC',

  // View Navigation & Rollback bằng useReducer
  CHON_BUOI_HOC: 'CHON_BUOI_HOC',
  DONG_BUOI_HOC: 'DONG_BUOI_HOC',
  XEM_CHI_TIET_HOC_SINH: 'XEM_CHI_TIET_HOC_SINH',
  DONG_CHI_TIET_HOC_SINH: 'DONG_CHI_TIET_HOC_SINH',
  CHUYEN_BUOC: 'CHUYEN_BUOC',
  ROLLBACK_BUOC: 'ROLLBACK_BUOC',
  RESTORE_STATE_FROM_NAV: 'RESTORE_STATE_FROM_NAV',

  SET_ERROR: 'SET_ERROR'
};

// ── 3. INITIAL STATE ──
const initialState = {
  // Quản lý tiến trình & view mode
  currentStep: TIEN_TRINH_DIEM_DANH.BUOC_1_CHI_NHANH,
  viewMode: VIEW_MODES.MAIN,
  historyStack: [], // Mảng lưu các snapshot bước trước để rollback an toàn

  // Tầng 1: Chi nhánh
  chiNhanhList: [],
  selectedCn: null,

  // Tầng 2: Kỳ học, Bộ môn & Lớp học
  kyHocList: [],
  selectedKyHocId: null,
  boMonList: [],
  selectedBoMonId: null,
  lopHocList: [],
  selectedLopHoc: null,
  tabLopTrangThai: 'CHUA_HOAN_THANH', // 'CHUA_HOAN_THANH' | 'DA_HOAN_THANH'
  searchLopKw: '',

  // Tầng 3: Khóa học thuộc lớp
  khoaHocList: [],
  selectedKhoaHoc: null,

  // Sub-views
  selectedBuoiHoc: null,
  selectedHocSinhDetail: null,

  // Loading & Error
  loadingInit: true,
  loadingLopHoc: false,
  loadingKhoaHoc: false,
  error: null
};

// ── 4. REDUCER QUẢN LÝ TIẾN TRÌNH, VIEW TRANSITIONS & ROLLBACK ──
function diemDanhReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING_INIT:
      return { ...state, loadingInit: action.payload };

    case ACTIONS.SET_CHI_NHANH_LIST: {
      const branches = action.payload || [];
      const selected = state.selectedCn || (branches.length > 0 ? branches[0] : null);
      return {
        ...state,
        chiNhanhList: branches,
        selectedCn: selected,
        loadingInit: false
      };
    }

    case ACTIONS.CHON_CHI_NHANH: {
      const newCn = action.payload;
      return {
        ...state,
        selectedCn: newCn,
        selectedLopHoc: null,
        selectedKhoaHoc: null,
        selectedBuoiHoc: null,
        selectedHocSinhDetail: null,
        currentStep: TIEN_TRINH_DIEM_DANH.BUOC_2_LOP_HOC,
        viewMode: VIEW_MODES.MAIN,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedKyHocId: state.selectedKyHocId,
            selectedBoMonId: state.selectedBoMonId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc
          }
        ]
      };
    }

    case ACTIONS.SET_KY_HOC_LIST:
      return { ...state, kyHocList: action.payload || [] };

    case ACTIONS.CHON_KY_HOC:
      return {
        ...state,
        selectedKyHocId: action.payload,
        selectedLopHoc: null,
        selectedKhoaHoc: null,
        selectedBuoiHoc: null,
        selectedHocSinhDetail: null
      };

    case ACTIONS.SET_BO_MON_LIST:
      return { ...state, boMonList: action.payload || [] };

    case ACTIONS.CHON_BO_MON:
      return {
        ...state,
        selectedBoMonId: action.payload,
        selectedLopHoc: null,
        selectedKhoaHoc: null,
        selectedBuoiHoc: null,
        selectedHocSinhDetail: null
      };

    case ACTIONS.SET_LOADING_LOP:
      return { ...state, loadingLopHoc: action.payload };

    case ACTIONS.SET_LOP_HOC_LIST: {
      const classes = action.payload || [];
      return {
        ...state,
        lopHocList: classes,
        loadingLopHoc: false
      };
    }

    case ACTIONS.SET_TAB_LOP_TRANG_THAI:
      return {
        ...state,
        tabLopTrangThai: action.payload
      };

    case ACTIONS.SET_SEARCH_LOP_KW:
      return { ...state, searchLopKw: action.payload };

    case ACTIONS.CHON_LOP_HOC: {
      const newLop = action.payload;
      return {
        ...state,
        selectedLopHoc: newLop,
        selectedKhoaHoc: null,
        selectedBuoiHoc: null,
        selectedHocSinhDetail: null,
        currentStep: TIEN_TRINH_DIEM_DANH.BUOC_3_KHOA_HOC,
        viewMode: VIEW_MODES.MAIN,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedKyHocId: state.selectedKyHocId,
            selectedBoMonId: state.selectedBoMonId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc
          }
        ]
      };
    }

    case ACTIONS.SET_LOADING_KHOA_HOC:
      return { ...state, loadingKhoaHoc: action.payload };

    case ACTIONS.SET_KHOA_HOC_LIST: {
      const courses = action.payload || [];
      return {
        ...state,
        khoaHocList: courses,
        loadingKhoaHoc: false
      };
    }

    case ACTIONS.CHON_KHOA_HOC: {
      const newKhoaHoc = action.payload;
      return {
        ...state,
        selectedKhoaHoc: newKhoaHoc,
        selectedBuoiHoc: null,
        selectedHocSinhDetail: null,
        currentStep: TIEN_TRINH_DIEM_DANH.BUOC_4_DIEM_DANH,
        viewMode: VIEW_MODES.MAIN,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedKyHocId: state.selectedKyHocId,
            selectedBoMonId: state.selectedBoMonId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc
          }
        ]
      };
    }

    // ── ĐIỀU HƯỚNG VIEW MODE: CHI TIẾT HỌC SINH & BUỔI HỌC ──
    case ACTIONS.XEM_CHI_TIET_HOC_SINH:
      return {
        ...state,
        selectedHocSinhDetail: action.payload,
        viewMode: VIEW_MODES.STUDENT_DETAIL,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedKyHocId: state.selectedKyHocId,
            selectedBoMonId: state.selectedBoMonId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc,
            selectedHocSinhDetail: state.selectedHocSinhDetail,
            selectedBuoiHoc: state.selectedBuoiHoc
          }
        ]
      };

    case ACTIONS.DONG_CHI_TIET_HOC_SINH:
      return {
        ...state,
        selectedHocSinhDetail: null,
        viewMode: VIEW_MODES.MAIN
      };

    case ACTIONS.CHON_BUOI_HOC:
      return {
        ...state,
        selectedBuoiHoc: action.payload,
        viewMode: VIEW_MODES.BUOI_HOC,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedKyHocId: state.selectedKyHocId,
            selectedBoMonId: state.selectedBoMonId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc,
            selectedHocSinhDetail: state.selectedHocSinhDetail,
            selectedBuoiHoc: state.selectedBuoiHoc
          }
        ]
      };

    case ACTIONS.DONG_BUOI_HOC:
      return {
        ...state,
        selectedBuoiHoc: null,
        viewMode: VIEW_MODES.MAIN
      };

    case ACTIONS.CHUYEN_BUOC:
      return {
        ...state,
        currentStep: action.payload,
        viewMode: VIEW_MODES.MAIN,
        selectedHocSinhDetail: null,
        selectedBuoiHoc: null,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedKyHocId: state.selectedKyHocId,
            selectedBoMonId: state.selectedBoMonId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc
          }
        ]
      };

    case ACTIONS.ROLLBACK_BUOC: {
      if (state.historyStack.length === 0) {
        return {
          ...state,
          currentStep: TIEN_TRINH_DIEM_DANH.BUOC_1_CHI_NHANH,
          viewMode: VIEW_MODES.MAIN,
          selectedHocSinhDetail: null,
          selectedBuoiHoc: null
        };
      }
      const prevSnapshot = state.historyStack[state.historyStack.length - 1];
      const newStack = state.historyStack.slice(0, -1);
      return {
        ...state,
        currentStep: prevSnapshot.step ?? state.currentStep,
        viewMode: prevSnapshot.viewMode ?? VIEW_MODES.MAIN,
        selectedCn: prevSnapshot.selectedCn ?? state.selectedCn,
        selectedKyHocId: prevSnapshot.selectedKyHocId ?? state.selectedKyHocId,
        selectedBoMonId: prevSnapshot.selectedBoMonId !== undefined ? prevSnapshot.selectedBoMonId : state.selectedBoMonId,
        selectedLopHoc: prevSnapshot.selectedLopHoc !== undefined ? prevSnapshot.selectedLopHoc : state.selectedLopHoc,
        selectedKhoaHoc: prevSnapshot.selectedKhoaHoc !== undefined ? prevSnapshot.selectedKhoaHoc : state.selectedKhoaHoc,
        selectedBuoiHoc: prevSnapshot.selectedBuoiHoc ?? null,
        selectedHocSinhDetail: prevSnapshot.selectedHocSinhDetail ?? null,
        historyStack: newStack
      };
    }

    case ACTIONS.RESTORE_STATE_FROM_NAV: {
      const { restoreCnId, restoreKyHocId, restoreBoMonId } = action.payload;
      let matchedCn = state.selectedCn;
      if (restoreCnId && state.chiNhanhList.length > 0) {
        matchedCn = state.chiNhanhList.find(c => c.idCn === restoreCnId) || state.selectedCn;
      }
      return {
        ...state,
        selectedCn: matchedCn,
        selectedKyHocId: restoreKyHocId ?? state.selectedKyHocId,
        selectedBoMonId: restoreBoMonId ?? state.selectedBoMonId,
        currentStep: TIEN_TRINH_DIEM_DANH.BUOC_4_DIEM_DANH,
        viewMode: VIEW_MODES.MAIN
      };
    }

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loadingInit: false,
        loadingLopHoc: false,
        loadingKhoaHoc: false
      };

    default:
      return state;
  }
}

export default function TrangDiemDanh() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useTrangThaiXacThuc();
  const idDn = user?.idDoanhNghiep;

  // Đồng bộ thời gian toàn cục: Năm học & Kỳ học
  const { 
    selectedNamHocId: globalNamHocId,
    selectedKyHocId: globalKyHocId, 
    kyHocList: globalKyHocList,
    namHocList: globalNamHocList,
    loading: globalLoading,
    loadingKyHoc: globalLoadingKy,
    fetchNamHoc
  } = useNamHocKyHocStore();

  const [state, dispatch] = useReducer(diemDanhReducer, initialState);

  // Tự động kích hoạt tải năm học nếu store toàn cục chưa có dữ liệu
  useEffect(() => {
    if (idDn && (!globalNamHocList || globalNamHocList.length === 0) && !globalLoading) {
      fetchNamHoc(idDn);
    }
  }, [idDn, globalNamHocList?.length, globalLoading, fetchNamHoc]);

  // Tên kỳ học hiện tại từ thanh điều khiển toàn cục phía trên
  const currentKyHocName = useMemo(() => {
    if (!globalKyHocId) return 'Tất cả kỳ học';
    const found = (globalKyHocList || []).find(k => k.idKh === globalKyHocId || k.idKyHoc === globalKyHocId);
    return found?.tenKyHoc || `Kỳ #${globalKyHocId}`;
  }, [globalKyHocId, globalKyHocList]);

  // ── 5. TẢI DỮ LIỆU BAN ĐẦU: CHI NHÁNH, KỲ HỌC & BỘ MÔN ──
  const fetchInitialData = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING_INIT, payload: true });
      const [branchesRes, termsRes, boMonRes] = await Promise.all([
        dichVuDoanhNghiep.getChiNhanhTheoDoanhNghiep(idDn).catch(() => []),
        dichVuDaoTaoChung.getDanhSachKyHoc(idDn).catch(() => []),
        dichVuDaoTaoChung.getDanhSachBoMon(idDn).catch(() => [])
      ]);

      const branches = Array.isArray(branchesRes) ? branchesRes : (branchesRes?.data || []);
      const terms = Array.isArray(termsRes) ? termsRes : (termsRes?.data || []);
      const boMons = Array.isArray(boMonRes) ? boMonRes : (boMonRes?.data || []);

      dispatch({ type: ACTIONS.SET_CHI_NHANH_LIST, payload: branches });
      dispatch({ type: ACTIONS.SET_KY_HOC_LIST, payload: terms });
      dispatch({ type: ACTIONS.SET_BO_MON_LIST, payload: boMons });

      if (location.state?.restoreCnId || location.state?.restoreKhoaHocId) {
        dispatch({
          type: ACTIONS.RESTORE_STATE_FROM_NAV,
          payload: {
            restoreCnId: location.state.restoreCnId,
            restoreKyHocId: location.state.restoreKyHocId,
            restoreBoMonId: location.state.restoreBoMonId
          }
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu ban đầu cho Trang Điểm Danh:', err);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Không thể tải dữ liệu ban đầu' });
    }
  }, [idDn, location.state]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ── 6. TẢI DANH SÁCH LỚP HỌC THEO CHI NHÁNH & KỲ HỌC TOÀN CỤC ──
  const fetchLopHoc = useCallback(async () => {
    if (!state.selectedCn?.idCn) return;

    if (globalLoading || globalLoadingKy) return;

    const effectiveKyHoc = globalKyHocId || state.selectedKyHocId;
    if (!effectiveKyHoc && ((globalKyHocList && globalKyHocList.length > 0) || (globalNamHocList && globalNamHocList.length > 0))) {
      return;
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING_LOP, payload: true });
      const params = {
        idDn,
        idCn: state.selectedCn.idCn,
        ...(effectiveKyHoc ? { idKh: effectiveKyHoc } : {})
      };

      const res = await dichVuDaoTaoChung.getDanhSachLopHoc(params);
      const classes = Array.isArray(res) ? res : (res?.items || res?.data?.items || res?.data || []);
      dispatch({ type: ACTIONS.SET_LOP_HOC_LIST, payload: classes });

      if (location.state?.restoreLopId && classes.length > 0) {
        const matched = classes.find(c => c.idLop === location.state.restoreLopId);
        if (matched) {
          dispatch({ type: ACTIONS.CHON_LOP_HOC, payload: matched });
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách lớp học theo chi nhánh:', err);
      dispatch({ type: ACTIONS.SET_LOP_HOC_LIST, payload: [] });
    }
  }, [idDn, state.selectedCn?.idCn, globalKyHocId, globalNamHocId, globalLoading, globalLoadingKy, globalKyHocList?.length, globalNamHocList?.length, state.selectedKyHocId, location.state]);

  useEffect(() => {
    fetchLopHoc();
  }, [fetchLopHoc]);

  // ── 7. TẢI DANH SÁCH KHÓA HỌC THUỘC LỚP HỌC ĐÃ CHỌN ──
  const fetchKhoaHocCuaLop = useCallback(async () => {
    if (!state.selectedLopHoc?.idLop) return;

    try {
      dispatch({ type: ACTIONS.SET_LOADING_KHOA_HOC, payload: true });
      const res = await dichVuDaoTaoChung.getKhoaHocTheoLop(state.selectedLopHoc.idLop);
      let courses = Array.isArray(res) ? res : (res?.data || []);

      // Nếu API trả về rỗng nhưng lớp học có khóa học đính kèm
      if (courses.length === 0 && state.selectedLopHoc.khoaHoc) {
        courses = [state.selectedLopHoc.khoaHoc];
      }

      // Fallback: tìm theo môn học của lớp
      if (courses.length === 0 && state.selectedLopHoc.monHoc?.idMh) {
        const mhCourses = await dichVuDaoTaoChung.getDanhSachKhoaHoc(idDn).catch(() => []);
        const filtered = (Array.isArray(mhCourses) ? mhCourses : []).filter(k => 
          k.monHoc?.idMh === state.selectedLopHoc.monHoc?.idMh || k.idMh === state.selectedLopHoc.monHoc?.idMh
        );
        if (filtered.length > 0) courses = filtered;
      }

      // Fallback an toàn nếu lớp chưa gán khóa học: tạo object giả lập theo thông tin lớp
      if (courses.length === 0) {
        courses = [{
          idKhoaHoc: state.selectedLopHoc.idKhoaHoc || state.selectedLopHoc.idLop,
          tenKhoaHoc: state.selectedLopHoc.tenLop,
          idLop: state.selectedLopHoc.idLop,
          giaTien: 0,
          hocPhi: 0,
          boMon: state.selectedLopHoc.boMon || state.selectedLopHoc.monHoc
        }];
      }

      dispatch({ type: ACTIONS.SET_KHOA_HOC_LIST, payload: courses });

      if (location.state?.restoreKhoaHocId && courses.length > 0) {
        const matched = courses.find(c => c.idKhoaHoc === location.state.restoreKhoaHocId);
        if (matched) {
          dispatch({ type: ACTIONS.CHON_KHOA_HOC, payload: matched });
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải khóa học của lớp:', err);
      dispatch({ type: ACTIONS.SET_KHOA_HOC_LIST, payload: [] });
    }
  }, [idDn, state.selectedLopHoc?.idLop, location.state]);

  useEffect(() => {
    fetchKhoaHocCuaLop();
  }, [fetchKhoaHocCuaLop]);

  // ── 8. TỔNG HỢP DANH SÁCH CHUYÊN MÔN / BỘ MÔN ──
  const combinedBoMonList = useMemo(() => {
    const map = new Map();
    (state.boMonList || []).forEach(bm => {
      const id = bm.idBoMon || bm.idBm;
      if (id) map.set(Number(id), { idBoMon: Number(id), tenBoMon: bm.tenBoMon || bm.tenBm || `Bộ môn #${id}` });
    });
    (state.lopHocList || []).forEach(c => {
      const id = c.idBoMon ?? c.boMon?.idBoMon ?? c.monHoc?.idBoMon ?? c.khoaHoc?.idBoMon;
      const name = c.tenBoMon ?? c.boMon?.tenBoMon ?? c.monHoc?.tenBoMon;
      if (id && name && !map.has(Number(id))) {
        map.set(Number(id), { idBoMon: Number(id), tenBoMon: name });
      }
    });
    return Array.from(map.values());
  }, [state.boMonList, state.lopHocList]);

  // ── 9. PHÂN LOẠI LỚP HỌC: CHƯA HOÀN THÀNH & ĐÃ HOÀN THÀNH ──
  const { lopChuaHoanThanh, lopDaHoanThanh } = useMemo(() => {
    const chua = [];
    const da = [];
    const kw = state.searchLopKw.toLowerCase().trim();
    const bmId = state.selectedBoMonId;
    const effectiveKyHoc = globalKyHocId || state.selectedKyHocId;

    (state.lopHocList || []).forEach(c => {
      const classKhId = c.idKh || c.idKyHoc || c.kyHoc?.idKh;
      if (effectiveKyHoc && classKhId && Number(classKhId) !== Number(effectiveKyHoc)) {
        return;
      }

      const classNhId = c.idNamHoc || c.idNh || c.kyHoc?.namHoc?.idNh || c.namHoc?.idNh;
      if (globalNamHocId && classNhId && Number(classNhId) !== Number(globalNamHocId)) {
        return;
      }

      const matchKw = !kw || 
        (c.tenLop && c.tenLop.toLowerCase().includes(kw)) ||
        (c.khoaHoc?.tenKhoaHoc && c.khoaHoc.tenKhoaHoc.toLowerCase().includes(kw)) ||
        (c.monHoc?.tenMon && c.monHoc.tenMon.toLowerCase().includes(kw));

      const classBmId = c.idBoMon ?? c.idBm ?? c.boMon?.idBoMon ?? c.boMon?.idBm ?? c.monHoc?.idBoMon ?? c.monHoc?.boMon?.idBoMon ?? c.khoaHoc?.idBoMon;
      const matchBm = !bmId || (classBmId && Number(classBmId) === Number(bmId));

      if (matchKw && matchBm) {
        const isDone = c.trangThai === 'HOAN_THANH' || c.trangThai === 'KET_THUC' || c.trangThai === 'DaKetThuc';
        if (isDone) da.push(c);
        else chua.push(c);
      }
    });
    return { lopChuaHoanThanh: chua, lopDaHoanThanh: da };
  }, [state.lopHocList, state.searchLopKw, state.selectedBoMonId, globalKyHocId, globalNamHocId, state.selectedKyHocId]);

  if (!idDn) {
    return (
      <div className={styles.errorContainer}>
        <TrangBaoLoi 
          loi={403} 
          tieuDe="Không xác định được đơn vị quản lý" 
          thongDiep="Tài khoản của bạn chưa được liên kết với doanh nghiệp/trung tâm nào hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* ── HEADER CHÍNH ── */}
      <div className={`droplet-card ${styles.headerCard}`}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.headerIcon}>
            <FileCheck size={26} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>
              Điểm Danh & Chuyên Cần Theo Phân Cấp
            </h2>
          </div>
        </div>

        <div className={styles.headerActions}>
          {/* Nút Rollback về bước trước bằng useReducer */}
          {(state.currentStep > TIEN_TRINH_DIEM_DANH.BUOC_1_CHI_NHANH || state.viewMode !== VIEW_MODES.MAIN) && (
            <button
              onClick={() => dispatch({ type: ACTIONS.ROLLBACK_BUOC })}
              className={styles.btnBack}
              title="Quay lại bước trước đó trong tiến trình"
            >
              <ArrowLeft size={16} />
              Quay lại bước trước
            </button>
          )}

          <button
            onClick={() => {
              fetchInitialData();
              fetchLopHoc();
              fetchKhoaHocCuaLop();
            }}
            disabled={state.loadingInit || state.loadingLopHoc}
            className={styles.btnRefresh}
          >
            <RefreshCw size={15} className={(state.loadingInit || state.loadingLopHoc) ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── THÔNG BÁO LỖI NẾU CÓ ── */}
      {state.error && (
        <div className={styles.wFull}>
          <TrangBaoLoi 
            loi={state.error} 
            onThuLai={() => {
              dispatch({ type: ACTIONS.SET_ERROR, payload: null });
              fetchInitialData();
            }} 
          />
        </div>
      )}

      {/* ── MÀN HÌNH CHI TIẾT HỌC SINH (VIEW_MODES.STUDENT_DETAIL) ── */}
      {state.viewMode === VIEW_MODES.STUDENT_DETAIL && state.selectedHocSinhDetail ? (
        <div className={styles.studentDetailContainer}>
          <div className={`droplet-card ${styles.studentSubNav}`}>
            <div className={styles.studentSubNavLeft}>
              <button
                onClick={() => dispatch({ type: ACTIONS.ROLLBACK_BUOC })}
                className={styles.btnBackSmall}
              >
                <ArrowLeft size={15} />
                Quay lại bảng điểm danh lớp {state.selectedLopHoc?.tenLop}
              </button>

              <span className={styles.divider}>|</span>

              <div className={styles.studentNameGroup}>
                <GraduationCap size={16} className={styles.studentCapIcon} />
                <span>Hồ Sơ Học Sinh: {state.selectedHocSinhDetail.hoTen}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/hoc-sinh', { state: { selectedHocSinhId: state.selectedHocSinhDetail.idHs, hocSinh: state.selectedHocSinhDetail } })}
              className={styles.btnExternalLink}
              title="Mở toàn màn hình tại Trang Quản Lý Hồ Sơ Học Sinh"
            >
              <ExternalLink size={14} />
              Mở Trang Hồ Sơ Học Sinh
            </button>
          </div>

          <ChiTietHocSinhView
            hocSinh={state.selectedHocSinhDetail}
            onBack={() => dispatch({ type: ACTIONS.ROLLBACK_BUOC })}
          />
        </div>
      ) : state.viewMode === VIEW_MODES.BUOI_HOC && state.selectedBuoiHoc ? (
        /* ── MÀN HÌNH ĐIỂM DANH BUỔI HỌC (VIEW_MODES.BUOI_HOC) ── */
        <DiemDanhBuoiHocView
          buoiHoc={state.selectedBuoiHoc}
          khoaHoc={state.selectedKhoaHoc}
          lopHoc={state.selectedLopHoc}
          chiNhanh={state.selectedCn}
          onBack={() => dispatch({ type: ACTIONS.ROLLBACK_BUOC })}
          onAttendanceSaved={() => dispatch({ type: ACTIONS.ROLLBACK_BUOC })}
        />
      ) : (
        /* ── GIAO DIỆN CHÍNH: PHÂN CẤP 3 TẦNG + MA TRẬN ĐIỂM DANH ── */
        <>
          {/* TÁI SỬ DỤNG COMPONENT PHÂN CẤP ĐÀO TẠO */}
          <ThanhChonPhanCapDaoTao
            currentStep={state.currentStep}
            onChuyenBuoc={(step) => dispatch({ type: ACTIONS.CHUYEN_BUOC, payload: step })}
            nghiepVuTitle="Điểm Danh Học Sinh"
            nghiepVuIcon={<FileCheck size={13} />}

            // Tầng 1: Chi nhánh
            chiNhanhList={state.chiNhanhList}
            selectedCn={state.selectedCn}
            onSelectChiNhanh={(cn) => dispatch({ type: ACTIONS.CHON_CHI_NHANH, payload: cn })}
            loadingInit={state.loadingInit}

            // Tầng 2: Lớp học
            currentKyHocName={currentKyHocName}
            boMonList={combinedBoMonList}
            selectedBoMonId={state.selectedBoMonId}
            onSelectBoMon={(id) => dispatch({ type: ACTIONS.CHON_BO_MON, payload: id })}
            searchLopKw={state.searchLopKw}
            onChangeSearchLop={(kw) => dispatch({ type: ACTIONS.SET_SEARCH_LOP_KW, payload: kw })}
            tabLopTrangThai={state.tabLopTrangThai}
            onChangeTabLop={(tab) => dispatch({ type: ACTIONS.SET_TAB_LOP_TRANG_THAI, payload: tab })}
            lopChuaHoanThanh={lopChuaHoanThanh}
            lopDaHoanThanh={lopDaHoanThanh}
            selectedLopHoc={state.selectedLopHoc}
            onSelectLopHoc={(cls) => dispatch({ type: ACTIONS.CHON_LOP_HOC, payload: cls })}
            loadingLopHoc={state.loadingLopHoc}

            // Tầng 3: Khóa học thuộc lớp
            khoaHocList={state.khoaHocList}
            selectedKhoaHoc={state.selectedKhoaHoc}
            onSelectKhoaHoc={(kh) => dispatch({ type: ACTIONS.CHON_KHOA_HOC, payload: kh })}
            loadingKhoaHoc={state.loadingKhoaHoc}
          />

          {/* ── TẦNG 4: MA TRẬN TỔNG HỢP ĐIỂM DANH KHÓA HỌC ── */}
          {state.selectedKhoaHoc ? (
            <TongHopDiemDanhKhoaHocView
              khoaHoc={state.selectedKhoaHoc}
              lopHoc={state.selectedLopHoc}
              chiNhanh={state.selectedCn}
              onDiemDanhBuoiHoc={(buoi) => dispatch({ type: ACTIONS.CHON_BUOI_HOC, payload: buoi })}
              onSelectHocSinh={(hs) => dispatch({ type: ACTIONS.XEM_CHI_TIET_HOC_SINH, payload: hs })}
            />
          ) : state.selectedLopHoc ? (
            <div className={`droplet-card ${styles.emptyCourseCard}`}>
              <AlertCircle size={36} className={styles.emptyIconCourse} />
              <h3 className={styles.emptyTitle}>
                Vui lòng chọn một khóa học thuộc lớp ở bước 3 phía trên
              </h3>
              <p className={styles.emptyDesc}>
                Hệ thống sẽ hiển thị bảng ma trận chuyên cần đối chiếu từng buổi học kèm tỷ lệ đi học của học sinh.
              </p>
            </div>
          ) : (
            <div className={`droplet-card ${styles.emptyClassCard}`}>
              <AlertCircle size={40} className={styles.emptyIconClass} />
              <h3 className={styles.emptyTitleClass}>
                Vui lòng chọn cơ sở chi nhánh và lớp học để xem ma trận điểm danh
              </h3>
              <p className={styles.emptyDescClass}>
                Hệ thống sẽ hiển thị bảng đối chiếu chuyên cần từng học sinh qua từng buổi học kèm tỷ lệ phần trăm có mặt.
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
}
