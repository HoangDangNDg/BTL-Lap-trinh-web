import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DollarSign, 
  Building2, 
  BookOpen, 
  Layers, 
  Users, 
  Search, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink, 
  MapPin, 
  Check, 
  Calendar, 
  CreditCard, 
  Wallet, 
  Phone, 
  TrendingUp,
  GraduationCap,
  Receipt,
  ArrowRight,
  ChevronRight,
  Clock,
  Filter
} from 'lucide-react';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { dichVuTaiChinh } from '../../dich_vu/tao_tu_dong/dichVuTaiChinh';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import ChiTietHocSinhView from '../../thanh_phan/quan_ly_lop_hoc/ChiTietHocSinhView';
import ThanhChonPhanCapDaoTao from '../../thanh_phan/dao_tao/ThanhChonPhanCapDaoTao';

// ── 1. ĐỊNH NGHĨA TIẾN TRÌNH 4 BƯỚC PHÂN CẤP & VIEW MODES ──
export const TIEN_TRINH_TRANG = {
  BUOC_1_CHI_NHANH: 1, // Chọn Chi nhánh
  BUOC_2_LOP_HOC: 2,   // Chọn Lớp học chi nhánh trong kỳ học
  BUOC_3_KHOA_HOC: 3,  // Chọn Khóa học của lớp học (có bộ lọc chuyên môn)
  BUOC_4_KIEM_SOAT: 4  // Bảng kiểm soát học phí khóa học
};

export const VIEW_MODES = {
  MAIN: 'MAIN',
  STUDENT_DETAIL: 'STUDENT_DETAIL'
};

// ── 2. ACTIONS CỦA USEREDUCER ──
const ACTIONS = {
  SET_LOADING_INIT: 'SET_LOADING_INIT',
  SET_CHI_NHANH_LIST: 'SET_CHI_NHANH_LIST',
  CHON_CHI_NHANH: 'CHON_CHI_NHANH',

  // Tầng 2: Kỳ học & Lớp học
  SET_KY_HOC_LIST: 'SET_KY_HOC_LIST',
  CHON_KY_HOC: 'CHON_KY_HOC',
  SET_LOADING_LOP: 'SET_LOADING_LOP',
  SET_LOP_HOC_LIST: 'SET_LOP_HOC_LIST',
  SET_TAB_LOP_TRANG_THAI: 'SET_TAB_LOP_TRANG_THAI',
  CHON_LOP_HOC: 'CHON_LOP_HOC',
  SET_SEARCH_LOP_KW: 'SET_SEARCH_LOP_KW',

  // Tầng 3: Bộ môn & Khóa học
  SET_BO_MON_LIST: 'SET_BO_MON_LIST',
  CHON_BO_MON: 'CHON_BO_MON',
  SET_LOADING_KHOA_HOC: 'SET_LOADING_KHOA_HOC',
  SET_KHOA_HOC_LIST: 'SET_KHOA_HOC_LIST',
  CHON_KHOA_HOC: 'CHON_KHOA_HOC',

  // Tầng 4: Thanh toán học phí
  SET_LOADING_THANH_TOAN: 'SET_LOADING_THANH_TOAN',
  SET_THANH_TOAN_DATA: 'SET_THANH_TOAN_DATA',
  SET_FILTER_STATUS: 'SET_FILTER_STATUS',
  SET_SEARCH_HS_KW: 'SET_SEARCH_HS_KW',

  // Quản lý tiến trình & Rollback
  CHUYEN_BUOC: 'CHUYEN_BUOC',
  ROLLBACK_BUOC: 'ROLLBACK_BUOC',
  RESTORE_STATE_FROM_NAV: 'RESTORE_STATE_FROM_NAV',

  // Xem chi tiết hồ sơ học sinh inline
  XEM_CHI_TIET_HOC_SINH: 'XEM_CHI_TIET_HOC_SINH',
  DONG_CHI_TIET_HOC_SINH: 'DONG_CHI_TIET_HOC_SINH',

  SET_ERROR: 'SET_ERROR'
};

// ── 3. INITIAL STATE ──
const initialState = {
  // Quản lý tiến trình (Step progression & rollback stack)
  currentStep: TIEN_TRINH_TRANG.BUOC_1_CHI_NHANH,
  viewMode: VIEW_MODES.MAIN,
  historyStack: [], // Mảng lưu các snapshot bước trước để rollback an toàn

  // Tầng 1: Chi nhánh
  chiNhanhList: [],
  selectedCn: null,

  // Tầng 2: Kỳ học & Lớp học
  kyHocList: [],
  selectedKyHocId: null, // null = Tất cả kỳ
  lopHocList: [],
  selectedLopHoc: null,
  tabLopTrangThai: 'CHUA_HOAN_THANH', // 'CHUA_HOAN_THANH' | 'DA_HOAN_THANH'
  searchLopKw: '',

  // Tầng 3: Bộ môn & Khóa học thuộc lớp học
  boMonList: [],
  selectedBoMonId: null, // null = Tất cả chuyên môn
  khoaHocList: [],
  selectedKhoaHoc: null,

  // Tầng 4: Bảng Thanh Toán Học Phí Khóa Học Học Sinh (bảng thanh_toan_hoc_phi_khoa_hoc_hoc_sinh)
  danhSachThanhToan: [],
  filterStatus: 'ALL', // 'ALL' | 'HOAN_TAT' | 'CHUA_HOAN_TAT'
  searchHsKw: '',

  // Xem chi tiết học sinh
  selectedHocSinhDetail: null,

  // Trạng thái tải & lỗi
  loadingInit: true,
  loadingLopHoc: false,
  loadingKhoaHoc: false,
  loadingThanhToan: false,
  error: null
};

// ── 4. REDUCER QUẢN LÝ TIẾN TRÌNH & DỮ LIỆU ──
function phieuThuReducer(state, action) {
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
        selectedHocSinhDetail: null,
        viewMode: VIEW_MODES.MAIN,
        danhSachThanhToan: [],
        currentStep: TIEN_TRINH_TRANG.BUOC_2_LOP_HOC,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedBoMonId: state.selectedBoMonId,
            selectedKyHocId: state.selectedKyHocId,
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
        danhSachThanhToan: []
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
        selectedHocSinhDetail: null,
        viewMode: VIEW_MODES.MAIN,
        danhSachThanhToan: [],
        currentStep: TIEN_TRINH_TRANG.BUOC_3_KHOA_HOC,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedBoMonId: state.selectedBoMonId,
            selectedKyHocId: state.selectedKyHocId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc
          }
        ]
      };
    }

    case ACTIONS.SET_BO_MON_LIST:
      return { ...state, boMonList: action.payload || [] };

    case ACTIONS.CHON_BO_MON:
      return {
        ...state,
        selectedBoMonId: action.payload,
        selectedLopHoc: null,
        selectedKhoaHoc: null,
        selectedHocSinhDetail: null,
        danhSachThanhToan: []
      };

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
        selectedHocSinhDetail: null,
        viewMode: VIEW_MODES.MAIN,
        currentStep: newKhoaHoc ? TIEN_TRINH_TRANG.BUOC_4_KIEM_SOAT : TIEN_TRINH_TRANG.BUOC_3_KHOA_HOC,
        historyStack: newKhoaHoc ? [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedBoMonId: state.selectedBoMonId,
            selectedKyHocId: state.selectedKyHocId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc
          }
        ] : (state.historyStack.length > 0 ? state.historyStack.slice(0, -1) : [])
      };
    }

    case ACTIONS.CHUYEN_BUOC:
      return {
        ...state,
        currentStep: action.payload,
        viewMode: VIEW_MODES.MAIN,
        selectedHocSinhDetail: null,
        historyStack: [
          ...state.historyStack,
          {
            step: state.currentStep,
            viewMode: state.viewMode,
            selectedCn: state.selectedCn,
            selectedBoMonId: state.selectedBoMonId,
            selectedKyHocId: state.selectedKyHocId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc
          }
        ]
      };

    case ACTIONS.ROLLBACK_BUOC: {
      if (state.historyStack.length === 0) {
        return {
          ...state,
          currentStep: TIEN_TRINH_TRANG.BUOC_1_CHI_NHANH,
          viewMode: VIEW_MODES.MAIN,
          selectedHocSinhDetail: null
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
        currentStep: TIEN_TRINH_TRANG.BUOC_4_KIEM_SOAT,
        viewMode: VIEW_MODES.MAIN
      };
    }

    case ACTIONS.SET_LOADING_THANH_TOAN:
      return { ...state, loadingThanhToan: action.payload };

    case ACTIONS.SET_THANH_TOAN_DATA:
      return {
        ...state,
        danhSachThanhToan: action.payload || [],
        loadingThanhToan: false
      };

    case ACTIONS.SET_FILTER_STATUS:
      return { ...state, filterStatus: action.payload };

    case ACTIONS.SET_SEARCH_HS_KW:
      return { ...state, searchHsKw: action.payload };

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
            selectedBoMonId: state.selectedBoMonId,
            selectedKyHocId: state.selectedKyHocId,
            selectedLopHoc: state.selectedLopHoc,
            selectedKhoaHoc: state.selectedKhoaHoc,
            selectedHocSinhDetail: state.selectedHocSinhDetail
          }
        ]
      };

    case ACTIONS.DONG_CHI_TIET_HOC_SINH:
      return {
        ...state,
        selectedHocSinhDetail: null,
        viewMode: VIEW_MODES.MAIN
      };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loadingInit: false, loadingLopHoc: false, loadingKhoaHoc: false, loadingThanhToan: false };

    default:
      return state;
  }
}

export default function TrangPhieuThuHocPhi() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useTrangThaiXacThuc();
  const idDn = user?.idDoanhNghiep || 1;
  const { 
    selectedNamHocId: globalNamHocId,
    selectedKyHocId: globalKyHocId, 
    kyHocList: globalKyHocList,
    namHocList: globalNamHocList,
    loading: globalLoading,
    loadingKyHoc: globalLoadingKy,
    fetchNamHoc
  } = useNamHocKyHocStore();

  const [state, dispatch] = useReducer(phieuThuReducer, initialState);

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
      const [branchesRes, kyHocRes, boMonRes] = await Promise.all([
        dichVuDoanhNghiep.getChiNhanhTheoDoanhNghiep(idDn).catch(() => []),
        dichVuDaoTaoChung.getDanhSachKyHoc(idDn).catch(() => []),
        dichVuDaoTaoChung.getDanhSachBoMon(idDn).catch(() => [])
      ]);

      const branches = Array.isArray(branchesRes) ? branchesRes : (branchesRes?.data || []);
      const terms = Array.isArray(kyHocRes) ? kyHocRes : (kyHocRes?.data || []);
      const boMons = Array.isArray(boMonRes) ? boMonRes : (boMonRes?.data || []);

      dispatch({ type: ACTIONS.SET_CHI_NHANH_LIST, payload: branches });
      dispatch({ type: ACTIONS.SET_KY_HOC_LIST, payload: terms });
      dispatch({ type: ACTIONS.SET_BO_MON_LIST, payload: boMons });

      // Nếu có yêu cầu khôi phục trạng thái từ location state (khi quay lại từ trang giao dịch)
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
      console.error('Lỗi khi tải chi nhánh / kỳ học / bộ môn:', err);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Không thể tải dữ liệu ban đầu' });
    }
  }, [idDn, location.state]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ── 6. TẢI DANH SÁCH LỚP HỌC THEO CHI NHÁNH & KỲ HỌC TOÀN CỤC ──
  const fetchLopHoc = useCallback(async () => {
    if (!state.selectedCn?.idCn) return;

    // Chờ store thời gian toàn cục xác định xong Năm học & Kỳ học, tránh bị gửi request thiếu idKh gây tải tràn toàn bộ các năm
    if (globalLoading || globalLoadingKy) return;

    const effectiveKyHoc = globalKyHocId || state.selectedKyHocId;
    // Nếu trung tâm có dữ liệu năm/kỳ học mà chưa chọn xong effectiveKyHoc, hoãn fetch để không bị tải tràn toàn bộ các năm
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

      // Nếu cần khôi phục lớp học từ location.state
      if (location.state?.restoreLopId && classes.length > 0) {
        const matched = classes.find(c => c.idLop === location.state.restoreLopId);
        if (matched) {
          dispatch({ type: ACTIONS.CHON_LOP_HOC, payload: matched });
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách lớp học:', err);
      dispatch({ type: ACTIONS.SET_LOP_HOC_LIST, payload: [] });
    }
  }, [idDn, state.selectedCn?.idCn, globalKyHocId, globalNamHocId, globalLoading, globalLoadingKy, globalKyHocList?.length, globalNamHocList?.length, state.selectedKyHocId, location.state]);

  useEffect(() => {
    fetchLopHoc();
  }, [fetchLopHoc]);

  // ── 7. TẢI KHÓA HỌC THUỘC LỚP HỌC ĐÃ CHỌN ──
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

      // Nếu vẫn không có, fallback lấy khóa học của môn học hoặc doanh nghiệp
      if (courses.length === 0 && state.selectedLopHoc.monHoc?.idMh) {
        const mhCourses = await dichVuDaoTaoChung.getDanhSachKhoaHoc(idDn).catch(() => []);
        const filtered = (Array.isArray(mhCourses) ? mhCourses : []).filter(k => 
          k.monHoc?.idMh === state.selectedLopHoc.monHoc?.idMh || k.idMh === state.selectedLopHoc.monHoc?.idMh
        );
        if (filtered.length > 0) courses = filtered;
      }

      dispatch({ type: ACTIONS.SET_KHOA_HOC_LIST, payload: courses });

      // Nếu cần khôi phục khóa học từ location.state
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

  // ── 8. TẢI BẢNG THANH TOÁN HỌC PHÍ KHÓA HỌC (TẬN DỤNG BẢNG THANH_TOAN_HOC_PHI_KHOA_HOC_HOC_SINH) ──
  const fetchThanhToanKhoaHoc = useCallback(async () => {
    if (!state.selectedKhoaHoc?.idKhoaHoc) return;
    const courseId = state.selectedKhoaHoc.idKhoaHoc;
    const courseFee = Number(state.selectedKhoaHoc.giaTien || state.selectedKhoaHoc.hocPhi || 0);

    try {
      dispatch({ type: ACTIONS.SET_LOADING_THANH_TOAN, payload: true });

      const [thanhToanRes, phieuThuRes, studentsRes] = await Promise.all([
        dichVuTaiChinh.getThanhToanHocPhiTheoKhoaHoc(courseId).catch(() => []),
        dichVuTaiChinh.getPhieuThuTheoKhoaHoc(courseId).catch(() => []),
        dichVuHocSinhPhuHuynh.getHocSinhTheoKhoaHoc(courseId).catch(() => [])
      ]);

      const thanhToanList = Array.isArray(thanhToanRes) ? thanhToanRes : (thanhToanRes?.data || []);
      const phieuThuList = Array.isArray(phieuThuRes) ? phieuThuRes : (phieuThuRes?.data || []);
      const studentList = Array.isArray(studentsRes) ? studentsRes : (studentsRes?.data || []);

      const paymentMap = new Map();

      // Khởi tạo từ danh sách học sinh
      studentList.forEach(hs => {
        const studentId = hs?.idHs || hs?.idHocSinh;
        const studentName = hs?.hoTen || hs?.tenHocSinh || hs?.ten || '';
        const studentPhone = hs?.soDienThoai || hs?.sdt || '';
        const studentGender = hs?.gioiTinh || 'M';
        if (studentId) {
          paymentMap.set(studentId, {
            idThanhToan: null,
            hocSinh: {
              ...hs,
              idHs: studentId,
              hoTen: studentName,
              soDienThoai: studentPhone,
              gioiTinh: studentGender
            },
            tongTienPhaiNap: courseFee,
            soTienDaNap: 0,
            conThieu: courseFee,
            trangThai: false,
            phieuThuCount: 0
          });
        }
      });

      // Bổ sung dữ liệu từ bảng thanh_toan_hoc_phi_khoa_hoc_hoc_sinh
      thanhToanList.forEach(tt => {
        const hs = tt.hocSinh || tt.hocSinhKhoaHoc?.hocSinh;
        const idHs = hs?.idHs || tt.idHs;
        if (idHs) {
          const phaiNap = Number(tt.tongTienPhaiNap || courseFee);
          const daNap = Number(tt.soTienDaNap || 0);
          const conThieu = Math.max(0, phaiNap - daNap);
          const isDone = Boolean(tt.trangThai) || (phaiNap > 0 && daNap >= phaiNap);

          const existing = paymentMap.get(idHs) || { phieuThuCount: 0 };
          const resolvedHs = hs || existing.hocSinh || { idHs };
          const studentName = resolvedHs.hoTen || resolvedHs.tenHocSinh || resolvedHs.ten || existing.hocSinh?.hoTen || `Học sinh #${idHs}`;
          const studentPhone = resolvedHs.soDienThoai || resolvedHs.sdt || existing.hocSinh?.soDienThoai || '';
          const studentGender = resolvedHs.gioiTinh || existing.hocSinh?.gioiTinh || 'M';

          paymentMap.set(idHs, {
            ...existing,
            idThanhToan: tt.idThanhToan,
            hocSinh: {
              ...resolvedHs,
              idHs,
              hoTen: studentName,
              soDienThoai: studentPhone,
              gioiTinh: studentGender
            },
            tongTienPhaiNap: phaiNap,
            soTienDaNap: daNap,
            conThieu,
            trangThai: isDone
          });
        }
      });

      // Đếm số lượng phiếu thu thực tế từ bảng phieu_thu_hoc_phi
      phieuThuList.forEach(pt => {
        const idHs = pt.hocSinh?.idHs || pt.idHs;
        if (idHs) {
          if (!paymentMap.has(idHs)) {
            paymentMap.set(idHs, {
              idThanhToan: null,
              hocSinh: pt.hocSinh || { idHs, hoTen: `Học sinh #${idHs}` },
              tongTienPhaiNap: courseFee,
              soTienDaNap: 0,
              conThieu: courseFee,
              trangThai: false,
              phieuThuCount: 0
            });
          }
          const item = paymentMap.get(idHs);
          item.phieuThuCount = (item.phieuThuCount || 0) + 1;
        }
      });

      const finalList = Array.from(paymentMap.values()).map(item => {
        const phaiNap = item.tongTienPhaiNap > 0 ? item.tongTienPhaiNap : courseFee;
        const daNap = item.soTienDaNap;
        const conThieu = Math.max(0, phaiNap - daNap);
        const isDone = item.trangThai || (phaiNap > 0 && daNap >= phaiNap);

        return {
          ...item,
          tongTienPhaiNap: phaiNap,
          soTienDaNap: daNap,
          conThieu,
          trangThai: isDone
        };
      });

      dispatch({ type: ACTIONS.SET_THANH_TOAN_DATA, payload: finalList });
    } catch (err) {
      console.error('Lỗi khi tải thanh toán học phí khóa học:', err);
      dispatch({ type: ACTIONS.SET_THANH_TOAN_DATA, payload: [] });
    }
  }, [state.selectedKhoaHoc]);

  useEffect(() => {
    fetchThanhToanKhoaHoc();
  }, [fetchThanhToanKhoaHoc]);

  // ── 9. TỔNG HỢP DANH SÁCH CHUYÊN MÔN / BỘ MÔN ──
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

  // ── 10. PHÂN LOẠI LỚP HỌC: CHƯA HOÀN THÀNH & ĐÃ HOÀN THÀNH (LỌC THEO KỲ HỌC, NĂM HỌC & CHUYÊN MÔN) ──
  const { lopChuaHoanThanh, lopDaHoanThanh } = useMemo(() => {
    const chua = [];
    const da = [];
    const kw = state.searchLopKw.toLowerCase().trim();
    const bmId = state.selectedBoMonId;
    const effectiveKyHoc = globalKyHocId || state.selectedKyHocId;

    (state.lopHocList || []).forEach(c => {
      // 1. Khóa chặt theo Kỳ học toàn cục (chỉ lấy lớp đúng kỳ học hiện tại)
      const classKhId = c.idKh || c.idKyHoc || c.kyHoc?.idKh;
      if (effectiveKyHoc && classKhId && Number(classKhId) !== Number(effectiveKyHoc)) {
        return;
      }

      // 2. Khóa chặt theo Năm học toàn cục (chỉ lấy lớp đúng năm học hiện tại)
      const classNhId = c.idNamHoc || c.kyHoc?.namHoc?.idNh || c.namHoc?.idNh;
      if (globalNamHocId && classNhId && Number(classNhId) !== Number(globalNamHocId)) {
        return;
      }

      // 3. Lọc theo từ khóa tìm kiếm
      const matchKw = !kw || 
        (c.tenLop && c.tenLop.toLowerCase().includes(kw)) ||
        (c.khoaHoc?.tenKhoaHoc && c.khoaHoc.tenKhoaHoc.toLowerCase().includes(kw)) ||
        (c.monHoc?.tenMon && c.monHoc.tenMon.toLowerCase().includes(kw));

      // 4. Lọc theo Chuyên môn / Bộ môn ở phía lớp học của chi nhánh
      const classBmId = c.idBoMon ?? c.boMon?.idBoMon ?? c.boMon?.idBm ?? c.monHoc?.idBoMon ?? c.monHoc?.boMon?.idBoMon ?? c.khoaHoc?.idBoMon;
      const matchBm = !bmId || (classBmId && Number(classBmId) === Number(bmId));

      if (matchKw && matchBm) {
        const isDone = c.trangThai === 'HOAN_THANH' || c.trangThai === 'KET_THUC';
        if (isDone) da.push(c);
        else chua.push(c);
      }
    });
    return { lopChuaHoanThanh: chua, lopDaHoanThanh: da };
  }, [state.lopHocList, state.searchLopKw, state.selectedBoMonId, globalKyHocId, globalNamHocId, state.selectedKyHocId]);

  // ── 11. ĐIỀU HƯỚNG SANG TRANG RIÊNG: GIAO DỊCH THU PHÍ HỌC SINH ──
  const handleNavigateToGiaoDich = (item) => {
    navigate('/phieu-thu/giao-dich', {
      state: {
        hocSinh: item.hocSinh,
        khoaHoc: state.selectedKhoaHoc,
        lopHoc: state.selectedLopHoc,
        chiNhanh: state.selectedCn,
        kyHocId: globalKyHocId || state.selectedKyHocId,
        boMonId: state.selectedBoMonId,
        thanhToanItem: item
      }
    });
  };

  // ── 11. THỐNG KÊ TỔNG QUAN TÀI CHÍNH TỪ BẢNG THANH TOÁN ──
  const summaryMetrics = useMemo(() => {
    let tongPhaiThu = 0;
    let tongDaThu = 0;
    let tongConNo = 0;
    let soHsHoanTat = 0;

    state.danhSachThanhToan.forEach(item => {
      tongPhaiThu += item.tongTienPhaiNap;
      tongDaThu += item.soTienDaNap;
      tongConNo += item.conThieu;
      if (item.trangThai) soHsHoanTat++;
    });

    const totalStudents = state.danhSachThanhToan.length;
    const tyLeHoanTat = totalStudents > 0 ? Math.round((soHsHoanTat / totalStudents) * 100) : 0;

    return {
      tongPhaiThu,
      tongDaThu,
      tongConNo,
      soHsHoanTat,
      totalStudents,
      tyLeHoanTat
    };
  }, [state.danhSachThanhToan]);

  // ── 12. BỘ LỌC VÀ TÌM KIẾM HỌC SINH ──
  const filteredStudents = useMemo(() => {
    return state.danhSachThanhToan.filter(item => {
      let matchFilter = true;
      if (state.filterStatus === 'HOAN_TAT') matchFilter = item.trangThai === true;
      else if (state.filterStatus === 'CHUA_HOAN_TAT') matchFilter = item.trangThai === false;

      const kw = state.searchHsKw.toLowerCase().trim();
      const hs = item.hocSinh || {};
      const studentName = hs.hoTen || hs.tenHocSinh || hs.ten || '';
      const studentPhone = hs.soDienThoai || hs.sdt || '';
      const matchKw = !kw || 
        (studentName && studentName.toLowerCase().includes(kw)) ||
        (studentPhone && studentPhone.includes(kw)) ||
        (String(hs.idHs || item.idHs).includes(kw));

      return matchFilter && matchKw;
    });
  }, [state.danhSachThanhToan, state.filterStatus, state.searchHsKw]);

  // Quay lại màn hình chọn khóa học / phân cấp
  const handleBackToCourseSelection = useCallback(() => {
    if (state.historyStack.length > 0) {
      dispatch({ type: ACTIONS.ROLLBACK_BUOC });
    } else {
      dispatch({ type: ACTIONS.CHON_KHOA_HOC, payload: null });
    }
  }, [state.historyStack.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', width: '100%', paddingBottom: '3.5rem' }}>
      
      {state.selectedKhoaHoc ? (
        /* ── MÀN HÌNH MỚI: THU CHI HỌC PHÍ TRONG KHÓA HỌC (TÁCH BIỆT RIÊNG) ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Chuyên Biệt Cho Khóa Học Đang Chọn */}
          <div 
            className="droplet-card"
            style={{
              padding: '1.25rem 1.65rem',
              borderRadius: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleBackToCourseSelection}
                className="droplet-pill"
                style={{
                  height: '42px',
                  padding: '0 1.15rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#0F172A',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Quay lại bảng chọn chi nhánh, lớp học, khóa học"
              >
                <ArrowLeft size={16} />
                <span>Chọn Khóa Khác</span>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                    {state.selectedKhoaHoc.tenKhoaHoc}
                  </h2>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE'
                  }}>
                    <BookOpen size={12} />
                    Khóa đào tạo
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.825rem', color: '#64748B', flexWrap: 'wrap' }}>
                  {state.selectedCn && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600' }}>
                      <Building2 size={14} style={{ color: '#0284C7' }} />
                      {state.selectedCn.tenCn}
                    </span>
                  )}
                  {state.selectedLopHoc && (
                    <>
                      <span style={{ color: '#CBD5E1' }}>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600' }}>
                        <GraduationCap size={14} style={{ color: '#10B981' }} />
                        {state.selectedLopHoc.tenLop}
                      </span>
                    </>
                  )}
                  {(state.selectedKhoaHoc.giaTien || state.selectedKhoaHoc.hocPhi) && (
                    <>
                      <span style={{ color: '#CBD5E1' }}>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: '800', color: '#059669' }}>
                        <CreditCard size={14} />
                        Học phí: {Number(state.selectedKhoaHoc.giaTien || state.selectedKhoaHoc.hocPhi).toLocaleString('vi-VN')} đ
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                onClick={fetchThanhToanKhoaHoc}
                disabled={state.loadingThanhToan}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={15} className={state.loadingThanhToan ? 'animate-spin' : ''} />
                Làm mới
              </button>
            </div>
          </div>
          
          {/* Xem chi tiết hồ sơ học sinh inline nếu đang chọn */}
          {state.selectedHocSinhDetail ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div 
                className="droplet-card"
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => dispatch({ type: ACTIONS.ROLLBACK_BUOC })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      color: '#0F172A',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={15} />
                    Quay lại bảng kiểm soát học phí khóa {state.selectedKhoaHoc.tenKhoaHoc}
                  </button>

                  <span style={{ color: '#CBD5E1' }}>|</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '800', color: '#0F172A' }}>
                    <GraduationCap size={16} style={{ color: '#2563EB' }} />
                    <span>Hồ Sơ Học Sinh: {state.selectedHocSinhDetail.hoTen}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/hoc-sinh', { state: { selectedHocSinhId: state.selectedHocSinhDetail.idHs, hocSinh: state.selectedHocSinhDetail } })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '10px',
                    border: '1px solid #BFDBFE',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
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
          ) : (
            <>
              {/* 4 Thẻ KPI Metrics Tài Chính Khóa Học */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '1.15rem'
              }}>
                <div 
                  className="droplet-card"
                  style={{
                    padding: '1.3rem',
                    borderRadius: '20px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}>
                    <Wallet size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase' }}>
                      Tổng Dự Kiến Thu
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1E3A8A', marginTop: '0.2rem' }}>
                      {summaryMetrics.tongPhaiThu.toLocaleString('vi-VN')} <span style={{ fontSize: '0.85rem' }}>đ</span>
                    </div>
                  </div>
                </div>

                <div 
                  className="droplet-card"
                  style={{
                    padding: '1.3rem',
                    borderRadius: '20px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                  }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803D', textTransform: 'uppercase' }}>
                      Tổng Tiền Đã Thu
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#14532D', marginTop: '0.2rem' }}>
                      {summaryMetrics.tongDaThu.toLocaleString('vi-VN')} <span style={{ fontSize: '0.85rem' }}>đ</span>
                    </div>
                  </div>
                </div>

                <div 
                  className="droplet-card"
                  style={{
                    padding: '1.3rem',
                    borderRadius: '20px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}>
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#B91C1C', textTransform: 'uppercase' }}>
                      Số Tiền Còn Thiếu
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#7F1D1D', marginTop: '0.2rem' }}>
                      {summaryMetrics.tongConNo.toLocaleString('vi-VN')} <span style={{ fontSize: '0.85rem' }}>đ</span>
                    </div>
                  </div>
                </div>

                <div 
                  className="droplet-card"
                  style={{
                    padding: '1.3rem',
                    borderRadius: '20px',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#9333EA',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                  }}>
                    <TrendingUp size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#7E22CE', textTransform: 'uppercase' }}>
                      <span>Hoàn Tất Thanh Toán</span>
                      <span>{summaryMetrics.tyLeHoanTat}%</span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#581C87', marginTop: '0.15rem' }}>
                      {summaryMetrics.soHsHoanTat}/{summaryMetrics.totalStudents} <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>HS hoàn tất</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thanh tìm kiếm & Tabs lọc trạng thái */}
              <div 
                className="droplet-card"
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '20px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="text"
                    placeholder="Tìm theo tên học sinh, số điện thoại, mã HS..."
                    value={state.searchHsKw}
                    onChange={e => dispatch({ type: ACTIONS.SET_SEARCH_HS_KW, payload: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 1rem 0.55rem 2.4rem',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC'
                    }}
                  />
                </div>

                {/* Tabs lọc Hoàn Tất / Chưa Hoàn Tất - 1 màu cố định với độ trong suốt 80% */}
                <div 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    gap: '0.35rem', 
                    backgroundColor: 'rgba(241, 245, 249, 0.85)', 
                    padding: '0.35rem', 
                    borderRadius: '14px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                >
                  {[
                    { id: 'ALL', label: 'Tất cả', count: state.danhSachThanhToan.length, icon: Users },
                    { id: 'HOAN_TAT', label: 'Đã hoàn tất', count: summaryMetrics.soHsHoanTat, icon: CheckCircle2 },
                    { id: 'CHUA_HOAN_TAT', label: 'Chưa hoàn tất', count: state.danhSachThanhToan.length - summaryMetrics.soHsHoanTat, icon: Clock }
                  ].map(tab => {
                    const isActive = state.filterStatus === tab.id;
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => dispatch({ type: ACTIONS.SET_FILTER_STATUS, payload: tab.id })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.45rem 0.95rem',
                          borderRadius: '10px',
                          border: isActive ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid transparent',
                          backgroundColor: isActive ? 'rgba(37, 99, 235, 0.8)' : 'transparent',
                          color: isActive ? '#FFFFFF' : '#64748B',
                          fontWeight: isActive ? '700' : '600',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.28)' : 'none',
                          backdropFilter: isActive ? 'blur(8px)' : 'none',
                          WebkitBackdropFilter: isActive ? 'blur(8px)' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {IconComp && (
                          <IconComp 
                            size={14} 
                            style={{ 
                              color: isActive ? '#FFFFFF' : '#64748B',
                              opacity: isActive ? 1 : 0.8 
                            }} 
                          />
                        )}
                        <span>{tab.label}</span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '20px',
                            height: '19px',
                            padding: '0 6px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(100, 116, 139, 0.12)',
                            color: isActive ? '#FFFFFF' : '#475569',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LƯỚI THẺ THANH TOÁN HỌC PHÍ HỌC SINH KHÓA HỌC */}
              {state.loadingThanhToan ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
                  Đang tải bảng kiểm soát học phí học sinh khóa học...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div 
                  className="droplet-card"
                  style={{
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    borderRadius: '24px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <AlertCircle size={40} style={{ color: '#94A3B8', marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
                    Chưa có học sinh nào trong danh sách thanh toán
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
                    Khóa học này hiện chưa có học sinh ghi danh hoặc không có dữ liệu phù hợp với bộ lọc tìm kiếm.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '1.25rem'
                }}>
                  {filteredStudents.map((item) => {
                    const hs = item.hocSinh || {};
                    const studentName = hs.hoTen || hs.tenHocSinh || hs.ten || (item.tenHocSinh || `Học sinh #${hs.idHs || item.idHs || '---'}`);
                    const initials = studentName 
                      ? studentName.split(' ').filter(Boolean).map(n => n[0]).slice(-2).join('').toUpperCase() 
                      : 'HS';

                    const isDone = item.trangThai === true;
                    const percent = item.tongTienPhaiNap > 0 
                      ? Math.min(100, Math.round((item.soTienDaNap / item.tongTienPhaiNap) * 100)) 
                      : 0;

                    return (
                      <div
                        key={hs.idHs}
                        className="droplet-card"
                        style={{
                          padding: '1.35rem',
                          borderRadius: '20px',
                          backgroundColor: '#FFFFFF',
                          border: isDone ? '1px solid #DCFCE7' : '1px solid #FEE2E2',
                          boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                      >
                        {/* Header Thẻ: Avatar, Tên học sinh, Badge hoàn tất */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div 
                              onClick={() => dispatch({ type: ACTIONS.XEM_CHI_TIET_HOC_SINH, payload: hs })}
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                backgroundColor: hs.gioiTinh === 'F' ? '#FDF2F8' : '#EFF6FF',
                                color: hs.gioiTinh === 'F' ? '#DB2777' : '#2563EB',
                                fontSize: '0.9rem',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                cursor: 'pointer'
                              }}
                              title="Xem hồ sơ chi tiết học sinh"
                            >
                              {initials}
                            </div>
                            <div>
                              <div 
                                onClick={() => dispatch({ type: ACTIONS.XEM_CHI_TIET_HOC_SINH, payload: hs })}
                                style={{ 
                                  fontSize: '0.98rem', 
                                  fontWeight: '800', 
                                  color: '#1E40AF',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.textDecoration = 'underline'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#1E40AF'; e.currentTarget.style.textDecoration = 'none'; }}
                                title="Nhấp vào chữ để xem thông tin chi tiết học sinh"
                              >
                                {studentName}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                                <Phone size={12} /> {hs.soDienThoai || hs.sdt || 'Chưa có SĐT'}
                              </div>
                            </div>
                          </div>

                          {/* Badge hoàn thành từ bảng thanh_toan_hoc_phi_khoa_hoc_hoc_sinh */}
                          <span style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            backgroundColor: isDone ? '#DCFCE7' : '#FEE2E2',
                            color: isDone ? '#15803D' : '#B91C1C',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {isDone ? '✓ HOÀN TẤT' : '⚠ CÒN THIẾU'}
                          </span>
                        </div>

                        {/* Hộp số liệu thanh toán */}
                        <div style={{
                          padding: '0.85rem 1.1rem',
                          borderRadius: '14px',
                          backgroundColor: '#F8FAFC',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid #F1F5F9'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Đã nộp:</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#15803D', marginTop: '0.1rem' }}>
                              {item.soTienDaNap.toLocaleString('vi-VN')} đ
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>Còn thiếu:</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: item.conThieu > 0 ? '#DC2626' : '#15803D', marginTop: '0.1rem' }}>
                              {item.conThieu.toLocaleString('vi-VN')} đ
                            </div>
                          </div>
                        </div>

                        {/* Thanh Progress bar tiến độ đóng học phí */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginBottom: '0.3rem', fontWeight: '600' }}>
                            <span>Tiến độ thanh toán:</span>
                            <span style={{ fontWeight: '800', color: isDone ? '#15803D' : '#D97706' }}>{percent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', borderRadius: '9999px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                            <div style={{
                              width: `${percent}%`,
                              height: '100%',
                              backgroundColor: isDone ? '#16A34A' : '#F59E0B',
                              borderRadius: '9999px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>

                        {/* NÚT CHÍNH: TÁCH BIỆT CHUYỂN SANG TRANG GIAO DỊCH THU HỌC PHÍ RIÊNG */}
                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                          <button
                            onClick={() => handleNavigateToGiaoDich(item)}
                            style={{
                              flex: 1,
                              padding: '0.65rem',
                              borderRadius: '12px',
                              border: 'none',
                              backgroundColor: '#2563EB',
                              color: '#FFFFFF',
                              fontSize: '0.84rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.45rem',
                              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
                              transition: 'all 0.15s'
                            }}
                          >
                            <Receipt size={15} />
                            Xem Giao Dịch & Thu Phí ➔
                          </button>

                          <button
                            onClick={() => dispatch({ type: ACTIONS.XEM_CHI_TIET_HOC_SINH, payload: hs })}
                            style={{
                              padding: '0.65rem 0.95rem',
                              borderRadius: '12px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              color: '#334155',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                            title="Xem chi tiết hồ sơ học sinh"
                          >
                            Hồ Sơ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>
      ) : (
        /* ── MÀN HÌNH CHỌN PHÂN CẤP ĐÀO TẠO (BƯỚC 1: CHI NHÁNH ➔ BƯỚC 2: LỚP HỌC ➔ BƯỚC 3: KHÓA HỌC) ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Header Chọn Phân Cấp */}
          <div 
            className="droplet-card"
            style={{
              padding: '1.4rem 1.75rem',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
              }}>
                <DollarSign size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Thu Học Phí Học Sinh
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#64748B', fontWeight: '500' }}>
                  Chọn Chi nhánh ➔ Lớp học ➔ Khóa học để quản lý thu học phí chi tiết
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {state.currentStep > TIEN_TRINH_TRANG.BUOC_1_CHI_NHANH && (
                <button
                  onClick={() => dispatch({ type: ACTIONS.ROLLBACK_BUOC })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    fontSize: '0.84rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
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
                disabled={state.loadingInit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#334155',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={15} className={state.loadingInit ? 'animate-spin' : ''} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Thanh Chọn Phân Cấp Đào Tạo */}
          <ThanhChonPhanCapDaoTao
            currentStep={state.currentStep}
            onChuyenBuoc={(step) => dispatch({ type: ACTIONS.CHUYEN_BUOC, payload: step })}
            nghiepVuTitle="Thu Học Phí Học Sinh"
            nghiepVuIcon={<DollarSign size={13} />}

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
        </div>
      )}

    </div>
  );
}
