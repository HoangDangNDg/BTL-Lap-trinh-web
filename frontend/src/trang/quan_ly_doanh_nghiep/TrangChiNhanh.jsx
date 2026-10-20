import React, { useReducer, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Users, 
  MapPin, 
  Search, 
  RefreshCw, 
  DoorClosed, 
  ShieldCheck, 
  Wrench, 
  Phone, 
  Mail, 
  ChevronRight, 
  ArrowLeft, 
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  Banknote
} from 'lucide-react';
import { LiquidGlassTabs } from '../../components/ui/liquid-glass-button';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { dichVuNhanSu } from '../../dich_vu/tao_tu_dong/dichVuNhanSu';
import TheChiNhanh from '../../thanh_phan/chi_nhanh/TheChiNhanh';
import ModalWrapper from '../../thanh_phan/ModalWrapper';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import styles from './TrangChiNhanh.module.css';

// ── KHỞI TẠO STATE & REDUCER QUẢN LÝ KHỐI CHI NHÁNH ──
const initialChiNhanhState = {
  selectedBranch: null,
  chiNhanhs: [],
  loadingBranches: true,
  branchSearchKeyword: '',

  showAddBranchModal: false,
  newBranchData: { tenCn: '', diaChi: '', sdt: '' },
  submittingBranch: false,
  branchError: '',

  activeTab: 'coSoVatChat',

  phongHocs: [],
  loadingPhongHoc: false,
  phongSearchKeyword: '',
  selectedLoaiPhong: '',
  showAddPhongModal: false,
  newPhongData: { tenPhong: '', loaiPhong: 'Lý thuyết', sucChua: 30 },
  submittingPhong: false,
  phongError: '',

  nhanSuSubTab: 'quanLy',
  quanLys: [],
  nhanCongs: [],
  loadingNhanSu: false,
  nhanSuSearchKeyword: '',

  showAddQuanLyModal: false,
  newQuanLyData: { hoTen: '', sdt: '', email: '', cccd: '', mucLuong: '' },
  submittingQuanLy: false,
  quanLyError: '',

  showAddNhanCongModal: false,
  newNhanCongData: { hoTen: '', viTriCongViec: 'Bảo vệ', sdt: '', email: '', mucLuong: '' },
  submittingNhanCong: false,
  nhanCongError: ''
};

function chiNhanhReducer(state, action) {
  switch (action.type) {
    case 'FETCH_BRANCHES_START':
      return { ...state, loadingBranches: true };
    case 'FETCH_BRANCHES_SUCCESS':
      return { ...state, loadingBranches: false, chiNhanhs: action.payload };
    case 'FETCH_BRANCHES_FAILURE':
      return { ...state, loadingBranches: false, chiNhanhs: [] };

    case 'SELECT_BRANCH':
      return {
        ...state,
        selectedBranch: action.payload.branch,
        activeTab: action.payload.tab || 'coSoVatChat',
        phongSearchKeyword: '',
        selectedLoaiPhong: '',
        nhanSuSearchKeyword: ''
      };

    case 'SET_BRANCH_KEYWORD':
      return { ...state, branchSearchKeyword: action.payload };

    case 'SET_SHOW_ADD_BRANCH_MODAL':
      return { ...state, showAddBranchModal: action.payload, branchError: '' };

    case 'SET_NEW_BRANCH_DATA':
      return {
        ...state,
        newBranchData: typeof action.payload === 'function' ? action.payload(state.newBranchData) : { ...state.newBranchData, ...action.payload }
      };

    case 'SET_BRANCH_ERROR':
      return { ...state, branchError: action.payload, submittingBranch: false };

    case 'SET_SUBMITTING_BRANCH':
      return { ...state, submittingBranch: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    // Phòng học
    case 'FETCH_PHONG_HOC_START':
      return { ...state, loadingPhongHoc: true };
    case 'FETCH_PHONG_HOC_SUCCESS':
      return { ...state, loadingPhongHoc: false, phongHocs: action.payload };
    case 'FETCH_PHONG_HOC_FAILURE':
      return { ...state, loadingPhongHoc: false, phongHocs: [] };

    case 'SET_PHONG_KEYWORD':
      return { ...state, phongSearchKeyword: action.payload };
    case 'SET_LOAI_PHONG':
      return { ...state, selectedLoaiPhong: action.payload };
    case 'SET_SHOW_ADD_PHONG_MODAL':
      return { ...state, showAddPhongModal: action.payload, phongError: '' };
    case 'SET_NEW_PHONG_DATA':
      return {
        ...state,
        newPhongData: typeof action.payload === 'function' ? action.payload(state.newPhongData) : { ...state.newPhongData, ...action.payload }
      };
    case 'SET_PHONG_ERROR':
      return { ...state, phongError: action.payload, submittingPhong: false };
    case 'SET_SUBMITTING_PHONG':
      return { ...state, submittingPhong: action.payload };

    // Ban quản lý & Nhân sự
    case 'SET_NHAN_SU_SUB_TAB':
      return { ...state, nhanSuSubTab: action.payload };
    case 'FETCH_NHAN_SU_START':
      return { ...state, loadingNhanSu: true };
    case 'FETCH_NHAN_SU_SUCCESS':
      return { ...state, loadingNhanSu: false, quanLys: action.payload.quanLys, nhanCongs: action.payload.nhanCongs };
    case 'FETCH_NHAN_SU_FAILURE':
      return { ...state, loadingNhanSu: false };
    case 'SET_NHAN_SU_KEYWORD':
      return { ...state, nhanSuSearchKeyword: action.payload };

    case 'SET_SHOW_ADD_QUAN_LY_MODAL':
      return { ...state, showAddQuanLyModal: action.payload, quanLyError: '' };
    case 'SET_NEW_QUAN_LY_DATA':
      return {
        ...state,
        newQuanLyData: typeof action.payload === 'function' ? action.payload(state.newQuanLyData) : { ...state.newQuanLyData, ...action.payload }
      };
    case 'SET_QUAN_LY_ERROR':
      return { ...state, quanLyError: action.payload, submittingQuanLy: false };
    case 'SET_SUBMITTING_QUAN_LY':
      return { ...state, submittingQuanLy: action.payload };

    case 'SET_SHOW_ADD_NHAN_CONG_MODAL':
      return { ...state, showAddNhanCongModal: action.payload, nhanCongError: '' };
    case 'SET_NEW_NHAN_CONG_DATA':
      return {
        ...state,
        newNhanCongData: typeof action.payload === 'function' ? action.payload(state.newNhanCongData) : { ...state.newNhanCongData, ...action.payload }
      };
    case 'SET_NHAN_CONG_ERROR':
      return { ...state, nhanCongError: action.payload, submittingNhanCong: false };
    case 'SET_SUBMITTING_NHAN_CONG':
      return { ...state, submittingNhanCong: action.payload };

    default:
      return state;
  }
}

const TrangChiNhanh = () => {
  const { user } = useTrangThaiXacThuc();

  const [state, dispatch] = useReducer(chiNhanhReducer, initialChiNhanhState);
  const {
    selectedBranch,
    chiNhanhs,
    loadingBranches,
    branchSearchKeyword,
    showAddBranchModal,
    newBranchData,
    submittingBranch,
    branchError,
    activeTab,
    phongHocs,
    loadingPhongHoc,
    phongSearchKeyword,
    selectedLoaiPhong,
    showAddPhongModal,
    newPhongData,
    submittingPhong,
    phongError,
    nhanSuSubTab,
    quanLys,
    nhanCongs,
    loadingNhanSu,
    nhanSuSearchKeyword,
    showAddQuanLyModal,
    newQuanLyData,
    submittingQuanLy,
    quanLyError,
    showAddNhanCongModal,
    newNhanCongData,
    submittingNhanCong,
    nhanCongError
  } = state;

  // Dispatch helpers
  const setSelectedBranch = (b) => dispatch({ type: 'SELECT_BRANCH', payload: { branch: b } });
  const setBranchSearchKeyword = (kw) => dispatch({ type: 'SET_BRANCH_KEYWORD', payload: kw });
  const setShowAddBranchModal = (val) => dispatch({ type: 'SET_SHOW_ADD_BRANCH_MODAL', payload: val });
  const setNewBranchData = (data) => dispatch({ type: 'SET_NEW_BRANCH_DATA', payload: data });
  const setBranchError = (err) => dispatch({ type: 'SET_BRANCH_ERROR', payload: err });
  const setSubmittingBranch = (val) => dispatch({ type: 'SET_SUBMITTING_BRANCH', payload: val });

  const setActiveTab = (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });

  const setPhongSearchKeyword = (kw) => dispatch({ type: 'SET_PHONG_KEYWORD', payload: kw });
  const setSelectedLoaiPhong = (lp) => dispatch({ type: 'SET_LOAI_PHONG', payload: lp });
  const setShowAddPhongModal = (val) => dispatch({ type: 'SET_SHOW_ADD_PHONG_MODAL', payload: val });
  const setNewPhongData = (data) => dispatch({ type: 'SET_NEW_PHONG_DATA', payload: data });
  const setPhongError = (err) => dispatch({ type: 'SET_PHONG_ERROR', payload: err });
  const setSubmittingPhong = (val) => dispatch({ type: 'SET_SUBMITTING_PHONG', payload: val });

  const setNhanSuSubTab = (subTab) => dispatch({ type: 'SET_NHAN_SU_SUB_TAB', payload: subTab });
  const setNhanSuSearchKeyword = (kw) => dispatch({ type: 'SET_NHAN_SU_KEYWORD', payload: kw });
  const setShowAddQuanLyModal = (val) => dispatch({ type: 'SET_SHOW_ADD_QUAN_LY_MODAL', payload: val });
  const setNewQuanLyData = (data) => dispatch({ type: 'SET_NEW_QUAN_LY_DATA', payload: data });
  const setQuanLyError = (err) => dispatch({ type: 'SET_QUAN_LY_ERROR', payload: err });
  const setSubmittingQuanLy = (val) => dispatch({ type: 'SET_SUBMITTING_QUAN_LY', payload: val });

  const setShowAddNhanCongModal = (val) => dispatch({ type: 'SET_SHOW_ADD_NHAN_CONG_MODAL', payload: val });
  const setNewNhanCongData = (data) => dispatch({ type: 'SET_NEW_NHAN_CONG_DATA', payload: data });
  const setNhanCongError = (err) => dispatch({ type: 'SET_NHAN_CONG_ERROR', payload: err });
  const setSubmittingNhanCong = (val) => dispatch({ type: 'SET_SUBMITTING_NHAN_CONG', payload: val });

  const tabOptions = [
    { value: 'coSoVatChat', label: 'Cơ Sở Vật Chất', icon: <DoorClosed size={17} /> },
    { value: 'banQuanLy', label: 'Ban Quản Lý & Nhân Sự', icon: <Users size={17} /> }
  ];

  const nhanSuSubOptions = [
    { value: 'quanLy', label: 'Cán Bộ Quản Lý', icon: <ShieldCheck size={16} /> },
    { value: 'nhanCong', label: 'Nhân Công Khác', icon: <Wrench size={16} /> }
  ];

  // 1. Lấy danh sách chi nhánh từ Backend API
  const fetchBranches = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_BRANCHES_START' });
      let res;
      if (user?.idDoanhNghiep && user?.vaiTro !== 'ADMIN') {
        res = await dichVuDoanhNghiep.getChiNhanhTheoDoanhNghiep(user.idDoanhNghiep);
      } else {
        res = await dichVuDoanhNghiep.getAllChiNhanh();
      }
      const dataList = res?.data !== undefined ? res.data : res;
      dispatch({ type: 'FETCH_BRANCHES_SUCCESS', payload: Array.isArray(dataList) ? dataList : [] });
    } catch (e) {
      console.error('Error fetching branches:', e);
      dispatch({ type: 'FETCH_BRANCHES_FAILURE' });
    }
  }, [user]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // 2. Lấy dữ liệu chi tiết khi đã chọn một Chi Nhánh
  const fetchBranchDetailData = useCallback(async (branch, tab) => {
    if (!branch) return;
    const idCn = Number(branch.idCn);

    // Tab 1: Cơ sở vật chất (Phòng học)
    if (tab === 'coSoVatChat') {
      try {
        dispatch({ type: 'FETCH_PHONG_HOC_START' });
        const res = await dichVuDoanhNghiep.getPhongHocTheoChiNhanh(idCn);
        const list = res?.data !== undefined ? res.data : res;
        dispatch({ type: 'FETCH_PHONG_HOC_SUCCESS', payload: Array.isArray(list) ? list : [] });
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        dispatch({ type: 'FETCH_PHONG_HOC_FAILURE' });
      }
    }

    // Tab 2: Ban quản lý & Nhân công khác
    if (tab === 'banQuanLy') {
      try {
        dispatch({ type: 'FETCH_NHAN_SU_START' });
        const [resQl, resNc] = await Promise.allSettled([
          dichVuDoanhNghiep.getQuanLyTheoChiNhanh(idCn),
          dichVuNhanSu.getNhanCongTheoChiNhanh(idCn)
        ]);

        let dQl = [];
        let dNc = [];
        if (resQl.status === 'fulfilled') {
          const d = resQl.value?.data !== undefined ? resQl.value.data : resQl.value;
          dQl = Array.isArray(d) ? d : [];
        }
        if (resNc.status === 'fulfilled') {
          const d = resNc.value?.data !== undefined ? resNc.value.data : resNc.value;
          dNc = Array.isArray(d) ? d : [];
        }
        dispatch({ type: 'FETCH_NHAN_SU_SUCCESS', payload: { quanLys: dQl, nhanCongs: dNc } });
      } catch (err) {
        console.error('Error fetching branch personnel:', err);
        dispatch({ type: 'FETCH_NHAN_SU_FAILURE' });
      }
    }
  }, []);

  // Xử lý khi ấn chọn một Khối Chi Nhánh
  const handleSelectBranch = (branch, defaultTab = 'coSoVatChat') => {
    dispatch({ type: 'SELECT_BRANCH', payload: { branch, tab: defaultTab } });
    fetchBranchDetailData(branch, defaultTab);
  };

  // Xử lý khi đổi Tab trong chi nhánh
  const handleChangeTab = (newTab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: newTab });
    fetchBranchDetailData(selectedBranch, newTab);
  };

  // ==========================================
  // XỬ LÝ SUBMIT CÁC FORM TẠO MỚI (CREATE)
  // ==========================================

  // 1. Thêm Chi Nhánh Mới
  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (!newBranchData.tenCn.trim()) {
      setBranchError('Vui lòng nhập tên chi nhánh');
      return;
    }
    try {
      setSubmittingBranch(true);
      setBranchError('');
      const idDn = user?.idDoanhNghiep || 1;
      await dichVuDoanhNghiep.createChiNhanh(idDn, {
        tenCn: newBranchData.tenCn.trim(),
        diaChi: newBranchData.diaChi.trim(),
        sdt: newBranchData.sdt.trim()
      });
      setNewBranchData({ tenCn: '', diaChi: '', sdt: '' });
      setShowAddBranchModal(false);
      await fetchBranches();
    } catch (err) {
      console.error('Error creating branch:', err);
      setBranchError('Không thể tạo chi nhánh, vui lòng thử lại');
    } finally {
      setSubmittingBranch(false);
    }
  };

  // 2. Thêm Phòng Học Mới (Cơ sở vật chất)
  const handleCreatePhongHoc = async (e) => {
    e.preventDefault();
    if (!newPhongData.tenPhong.trim()) {
      setPhongError('Vui lòng nhập tên phòng học');
      return;
    }
    try {
      setSubmittingPhong(true);
      setPhongError('');
      await dichVuDoanhNghiep.createPhongHoc(selectedBranch.idCn, {
        tenPhong: newPhongData.tenPhong.trim(),
        loaiPhong: newPhongData.loaiPhong,
        sucChua: Number(newPhongData.sucChua) || 30
      });
      setNewPhongData({ tenPhong: '', loaiPhong: 'Lý thuyết', sucChua: 30 });
      setShowAddPhongModal(false);
      await fetchBranchDetailData(selectedBranch, 'coSoVatChat');
    } catch (err) {
      console.error('Error creating classroom:', err);
      setPhongError('Không thể tạo phòng học, vui lòng thử lại');
    } finally {
      setSubmittingPhong(false);
    }
  };

  // 3. Thêm Cán Bộ Quản Lý Cơ Sở
  const handleCreateQuanLy = async (e) => {
    e.preventDefault();
    if (!newQuanLyData.hoTen.trim()) {
      setQuanLyError('Vui lòng nhập họ tên cán bộ quản lý');
      return;
    }
    try {
      setSubmittingQuanLy(true);
      setQuanLyError('');
      await dichVuDoanhNghiep.createQuanLyChiNhanh(selectedBranch.idCn, {
        hoTen: newQuanLyData.hoTen.trim(),
        sdt: newQuanLyData.sdt.trim(),
        email: newQuanLyData.email.trim(),
        cccd: newQuanLyData.cccd.trim(),
        mucLuong: Number(newQuanLyData.mucLuong) || 0
      });
      setNewQuanLyData({ hoTen: '', sdt: '', email: '', cccd: '', mucLuong: '' });
      setShowAddQuanLyModal(false);
      await fetchBranchDetailData(selectedBranch, 'banQuanLy');
    } catch (err) {
      console.error('Error creating manager:', err);
      setQuanLyError('Không thể thêm cán bộ quản lý, vui lòng thử lại');
    } finally {
      setSubmittingQuanLy(false);
    }
  };

  // 4. Thêm Nhân Công Khác Cơ Sở
  const handleCreateNhanCong = async (e) => {
    e.preventDefault();
    if (!newNhanCongData.hoTen.trim()) {
      setNhanCongError('Vui lòng nhập họ tên nhân sự');
      return;
    }
    try {
      setSubmittingNhanCong(true);
      setNhanCongError('');
      await dichVuNhanSu.createNhanCong(selectedBranch.idCn, {
        hoTen: newNhanCongData.hoTen.trim(),
        viTriCongViec: newNhanCongData.viTriCongViec.trim(),
        sdt: newNhanCongData.sdt.trim(),
        email: newNhanCongData.email.trim(),
        mucLuong: Number(newNhanCongData.mucLuong) || 0
      });
      setNewNhanCongData({ hoTen: '', viTriCongViec: 'Bảo vệ', sdt: '', email: '', mucLuong: '' });
      setShowAddNhanCongModal(false);
      await fetchBranchDetailData(selectedBranch, 'banQuanLy');
    } catch (err) {
      console.error('Error creating worker:', err);
      setNhanCongError('Không thể thêm nhân công khác, vui lòng thử lại');
    } finally {
      setSubmittingNhanCong(false);
    }
  };

  // ==========================================
  // BỘ LỌC TÌM KIẾM DỮ LIỆU
  // ==========================================

  // Lọc chi nhánh ở Màn hình 1
  const filteredBranches = chiNhanhs.filter((cn) => {
    if (!branchSearchKeyword.trim()) return true;
    const q = branchSearchKeyword.toLowerCase();
    return (cn.tenCn || '').toLowerCase().includes(q) || (cn.diaChi || '').toLowerCase().includes(q) || (cn.sdt || '').includes(q);
  });

  // Lọc Phòng Học (Tab 1)
  const filteredPhongHoc = phongHocs.filter((ph) => {
    if (phongSearchKeyword.trim()) {
      const q = phongSearchKeyword.toLowerCase();
      const matchName = (ph.tenPhong || '').toLowerCase().includes(q);
      const matchType = (ph.loaiPhong || '').toLowerCase().includes(q);
      if (!matchName && !matchType) return false;
    }
    if (selectedLoaiPhong && ph.loaiPhong !== selectedLoaiPhong) return false;
    return true;
  });

  // Lọc Quản Lý (Tab 2 - Mục A)
  const filteredQuanLy = quanLys.filter((ql) => {
    if (!nhanSuSearchKeyword.trim()) return true;
    const q = nhanSuSearchKeyword.toLowerCase();
    return (ql.hoTen || '').toLowerCase().includes(q) || (ql.sdt || '').includes(q) || (ql.email || '').toLowerCase().includes(q);
  });

  // Lọc Nhân Công Khác (Tab 2 - Mục B)
  const filteredNhanCong = nhanCongs.filter((nc) => {
    if (!nhanSuSearchKeyword.trim()) return true;
    const q = nhanSuSearchKeyword.toLowerCase();
    return (nc.hoTen || '').toLowerCase().includes(q) || (nc.viTriCongViec || '').toLowerCase().includes(q) || (nc.sdt || '').includes(q);
  });

  // =========================================================================
  // GIAO DIỆN 1: KHI VÀO TRANG SẼ HIỆN RA CÁC KHỐI CHI NHÁNH TINH GỌN
  // =========================================================================
  if (!selectedBranch) {
    return (
      <div className={styles.container}>
        
        {/* Header Banner Các Khối Chi Nhánh */}
        <div className={`droplet-card ${styles.headerBanner}`}>
          <div className={styles.headerInfo}>
            <div className={`droplet-circle ${styles.headerIcon}`}>
              <Building2 size={28} />
            </div>
            <div>
              <h2 className={styles.headerTitle}>
                Hệ Thống Các Chi Nhánh Cơ Sở
              </h2>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              onClick={() => setShowAddBranchModal(true)}
              className={`droplet-pill droplet-pill-mint ${styles.btnAdd}`}
            >
              <Plus size={18} />
              <span>Thêm Chi Nhánh Mới</span>
            </button>

            <button
              onClick={fetchBranches}
              className={`droplet-pill ${styles.btnRefresh}`}
              title="Làm mới danh sách chi nhánh"
            >
              <RefreshCw size={18} className={loadingBranches ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* LƯỚI CÁC KHỐI CHI NHÁNH TINH GỌN (GRID CARDS) */}
        {loadingBranches ? (
          <div className={`droplet-card ${styles.loadingCard}`}>
            <RefreshCw size={32} className={`animate-spin ${styles.loadingSpinner}`} />
            <p className={styles.loadingText}>Đang tải danh sách các khối chi nhánh...</p>
          </div>
        ) : (
          <div className={styles.branchGrid}>
            {/* Từng Thẻ Chi Nhánh Tinh Gọn */}
            {filteredBranches.map((cn) => (
              <TheChiNhanh
                key={cn.idCn}
                chiNhanh={cn}
                onSelect={() => handleSelectBranch(cn, 'coSoVatChat')}
              />
            ))}

            {/* NÚT THẺ DẤU CỘNG Ở CUỐI: THÊM CHI NHÁNH MỚI */}
            <div
              onClick={() => setShowAddBranchModal(true)}
              className={`droplet-card ${styles.addBranchCard}`}
            >
              <div className={`droplet-circle ${styles.addBranchIcon}`}>
                <Plus size={30} />
              </div>
              <div className={styles.textCenter}>
                <h3 className={styles.addBranchTitle}>
                  Thêm Chi Nhánh Mới
                </h3>
                <p className={styles.addBranchDesc}>
                  Mở rộng thêm cơ sở đào tạo mới vào hệ thống
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TẠO CHI NHÁNH MỚI */}
        <ModalWrapper
          isOpen={showAddBranchModal}
          onClose={() => setShowAddBranchModal(false)}
          maxWidth="max-w-[500px]"
          title={
            <div className={styles.modalHeader}>
              <div className={`droplet-circle ${styles.modalIcon} ${styles.modalIconGreen}`}>
                <Building2 size={24} />
              </div>
              <div>
                <h3 className={styles.modalTitle}>
                  Thêm Chi Nhánh Cơ Sở Mới
                </h3>
                <p className={styles.modalSubtitle}>
                  Điền thông tin cơ sở đào tạo cần khởi tạo
                </p>
              </div>
            </div>
          }
        >
          <form onSubmit={handleCreateBranch} className={styles.form}>
            {branchError && (
              <div className={styles.errorAlert}>
                {branchError}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Tên Chi Nhánh Cơ Sở *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Chi nhánh Cầu Giấy, Chi nhánh Quận 1..."
                value={newBranchData.tenCn}
                onChange={(e) => setNewBranchData({ ...newBranchData, tenCn: e.target.value })}
                className={`droplet-pill ${styles.formInput}`}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Địa Chỉ Cơ Sở
              </label>
              <input
                type="text"
                placeholder="VD: Số 123 Đường Nguyễn Huệ, TP.HCM"
                value={newBranchData.diaChi}
                onChange={(e) => setNewBranchData({ ...newBranchData, diaChi: e.target.value })}
                className={`droplet-pill ${styles.formInput}`}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Số Điện Thoại Hotline
              </label>
              <input
                type="text"
                placeholder="VD: 02838221234"
                value={newBranchData.sdt}
                onChange={(e) => setNewBranchData({ ...newBranchData, sdt: e.target.value })}
                className={`droplet-pill ${styles.formInput}`}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => setShowAddBranchModal(false)}
                className={`droplet-pill ${styles.btnCancel}`}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submittingBranch}
                className={`droplet-pill droplet-pill-mint ${styles.btnSubmit}`}
              >
                {submittingBranch && <RefreshCw size={15} className="animate-spin" />}
                <span>{submittingBranch ? 'Đang tạo...' : 'Lưu Chi Nhánh'}</span>
              </button>
            </div>
          </form>
        </ModalWrapper>

      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN 2: KHI ẤN VÀO CHI NHÁNH SẼ HIỂN THỊ NỘI DUNG 3 MỤC RIÊNG BIỆT
  // =========================================================================
  return (
    <div className={styles.container}>
      
      {/* 1. Header Navigation Bar (Nút quay lại chọn chi nhánh khác) */}
      <div className={`droplet-card ${styles.screen2Header}`}>
        <div className={styles.screen2HeaderInfo}>
          {/* Nút Quay lại danh sách chi nhánh (Icon-only tinh gọn) */}
          <button
            onClick={() => setSelectedBranch(null)}
            className={`droplet-pill droplet-pill-mint ${styles.btnBackBranch}`}
            title="Quay lại chọn chi nhánh khác"
          >
            <ArrowLeft size={19} />
          </button>

          <div className={styles.branchTitleGroup}>
            <div className={styles.branchHeaderFlex}>
              <h2 className={styles.branchDetailTitle}>
                {selectedBranch.tenCn}
              </h2>
            </div>
            <p className={styles.branchDetailSub}>
              {selectedBranch.diaChi || 'Cơ sở đào tạo chuẩn'} • SĐT: {selectedBranch.sdt || 'Chưa có'}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchBranchDetailData(selectedBranch, activeTab)}
          className={`droplet-pill ${styles.btnRefreshSmall}`}
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={18} className={loadingPhongHoc || loadingNhanSu ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. THANH 2 MỤC LỚN: 🏢 Cơ Sở Vật Chất | 👥 Ban Quản Lý & Nhân Sự */}
      <div className={`droplet-card ${styles.tabBarCard}`}>
        <LiquidGlassTabs
          options={tabOptions}
          value={activeTab}
          onChange={handleChangeTab}
          size="default"
        />
      </div>

      {/* ========================================================================= */}
      {/* ── MỤC 1: CƠ SỞ VẬT CHẤT (PHÒNG HỌC CỦA CHI NHÁNH) ── */}
      {/* ========================================================================= */}
      {activeTab === 'coSoVatChat' && (
        <div className={styles.tabContent}>
          
          {/* Thống kê nhanh phòng học cơ sở này */}
          <div className={styles.statGrid}>
            <div className={`droplet-card ${styles.statCard}`}>
              <span className={styles.statLabel}>Tổng số phòng học cơ sở</span>
              <div className={`${styles.statValue} ${styles.statValueDark}`}>
                {phongHocs.length} <span className={styles.statUnit}>phòng</span>
              </div>
            </div>

            <div className={`droplet-card ${styles.statCard}`}>
              <span className={styles.statLabel}>Tổng sức chứa học viên</span>
              <div className={`${styles.statValue} ${styles.statValueBlue}`}>
                {phongHocs.reduce((acc, curr) => acc + (curr.sucChua || 0), 0)} <span className={styles.statUnit}>chỗ ngồi</span>
              </div>
            </div>

            <div className={`droplet-card ${styles.statCard}`}>
              <span className={styles.statLabel}>Phòng lý thuyết / Lab</span>
              <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                {phongHocs.filter(p => (p.loaiPhong || '').toLowerCase().includes('lý thuyết')).length || phongHocs.length} <span className={styles.statUnit}>phòng</span>
              </div>
            </div>
          </div>

          {/* Thanh tìm kiếm & Nút thêm phòng học */}
          <div className={`droplet-card ${styles.toolbar}`}>
            <div className={styles.searchGroup}>
              <div className={styles.searchWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Tìm phòng theo tên (VD: Phòng 101, Lab A)..."
                  value={phongSearchKeyword}
                  onChange={(e) => setPhongSearchKeyword(e.target.value)}
                  className={`droplet-pill ${styles.searchInput}`}
                />
              </div>

              <div className={styles.selectWrapper}>
                <select
                  value={selectedLoaiPhong}
                  onChange={(e) => setSelectedLoaiPhong(e.target.value)}
                  className={`droplet-pill ${styles.selectLoaiPhong}`}
                >
                  <option value="">-- Tất cả loại --</option>
                  <option value="Lý thuyết">Lý Thuyết</option>
                  <option value="Thực hành">Thực Hành</option>
                  <option value="Lab Tin Học">Lab Tin Học</option>
                  <option value="Hội trường">Hội Trường</option>
                </select>
              </div>
            </div>

            {/* Nút Thêm Phòng Học Mới */}
            <button
              onClick={() => setShowAddPhongModal(true)}
              className={`droplet-pill droplet-pill-mint ${styles.btnActionMint}`}
            >
              <Plus size={17} />
              <span>Thêm Phòng Học</span>
            </button>
          </div>

          {/* Lưới thẻ phòng học */}
          {loadingPhongHoc ? (
            <div className={`droplet-card ${styles.loadingCard}`}>
              <RefreshCw size={28} className={`animate-spin ${styles.loadingSpinnerSmall}`} />
              <p>Đang nạp thông tin cơ sở vật chất phòng học...</p>
            </div>
          ) : (
            <div className={styles.phongGrid}>
              {filteredPhongHoc.map((ph) => (
                <div 
                  key={ph.idPhong}
                  className={`droplet-card ${styles.phongCard}`}
                >
                  <div>
                    <div className={styles.phongCardHeader}>
                      <div className={`droplet-circle ${styles.phongIcon}`}>
                        <DoorClosed size={24} />
                      </div>
                      <span className="badge badge-success">Sẵn sàng dạy</span>
                    </div>

                    <div className={styles.phongCardBody}>
                      <h3 className={styles.phongTitle}>
                        {ph.tenPhong}
                      </h3>
                      <span className={styles.phongSub}>
                        Phòng học đạt chuẩn
                      </span>
                    </div>
                  </div>

                  <div className={styles.phongCardFooter}>
                    <span className={styles.phongFooterLabel}>Loại: <strong className={styles.phongFooterValueDark}>{ph.loaiPhong || 'Lý thuyết'}</strong></span>
                    <span className={styles.phongFooterLabel}>Sức chứa: <strong className={styles.phongFooterValueGreen}>{ph.sucChua || 30} chỗ</strong></span>
                  </div>
                </div>
              ))}

              {/* Thẻ Thêm Phòng Học Mới ở cuối */}
              <div
                onClick={() => setShowAddPhongModal(true)}
                className={`droplet-card ${styles.addPhongCard}`}
              >
                <div className={`droplet-circle ${styles.addPhongIcon}`}>
                  <Plus size={24} />
                </div>
                <span className={styles.addPhongText}>+ Thêm Phòng Học</span>
              </div>
            </div>
          )}

          {/* MODAL THÊM PHÒNG HỌC */}
          <ModalWrapper
            isOpen={showAddPhongModal}
            onClose={() => setShowAddPhongModal(false)}
            maxWidth="max-w-[480px]"
            title={
              <div className={styles.modalHeader}>
                <div className={`droplet-circle ${styles.modalIcon} ${styles.modalIconBlue}`}>
                  <DoorClosed size={24} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>
                    Thêm Phòng Học Mới
                  </h3>
                  <p className={styles.modalSubtitle}>
                    Cơ sở: <strong>{selectedBranch.tenCn}</strong>
                  </p>
                </div>
              </div>
            }
          >
            <form onSubmit={handleCreatePhongHoc} className={styles.form}>
              {phongError && (
                <div className={styles.errorAlert}>
                  {phongError}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Tên Phòng Học *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phòng 101, Lab Tin Học A..."
                  value={newPhongData.tenPhong}
                  onChange={(e) => setNewPhongData({ ...newPhongData, tenPhong: e.target.value })}
                  className={`droplet-pill ${styles.formInput}`}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Loại Phòng Học
                </label>
                <select
                  value={newPhongData.loaiPhong}
                  onChange={(e) => setNewPhongData({ ...newPhongData, loaiPhong: e.target.value })}
                  className={`droplet-pill ${styles.formSelect}`}
                >
                  <option value="Lý thuyết">Phòng Lý Thuyết</option>
                  <option value="Thực hành">Phòng Thực Hành</option>
                  <option value="Lab Tin Học">Phòng Lab Tin Học</option>
                  <option value="Hội trường">Hội Trường Lớn</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Sức Chứa Chỗ Ngồi (Học Viên)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="30"
                  value={newPhongData.sucChua}
                  onChange={(e) => setNewPhongData({ ...newPhongData, sucChua: e.target.value })}
                  className={`droplet-pill ${styles.formInput}`}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowAddPhongModal(false)}
                  className={`droplet-pill ${styles.btnCancel}`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingPhong}
                  className={`droplet-pill droplet-pill-mint ${styles.btnSubmit}`}
                >
                  {submittingPhong && <RefreshCw size={15} className="animate-spin" />}
                  <span>{submittingPhong ? 'Đang tạo...' : 'Lưu Phòng Học'}</span>
                </button>
              </div>
            </form>
          </ModalWrapper>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ── MỤC 2: BAN QUẢN LÝ (QUẢN LÝ & NHÂN CÔNG KHÁC TÌM THEO ID CN) ── */}
      {/* ========================================================================= */}
      {activeTab === 'banQuanLy' && (
        <div className={styles.tabContent}>
          
          {/* Sub-tabs lựa chọn 2 mục: Quản lý vs Nhân công khác */}
          <div className={styles.tabCenter}>
            <LiquidGlassTabs
              options={nhanSuSubOptions}
              value={nhanSuSubTab}
              onChange={(val) => setNhanSuSubTab(val)}
              size="default"
            />
          </div>

          {/* Thanh tìm kiếm & Nút thêm nhân sự */}
          <div className={`droplet-card ${styles.toolbar}`}>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={nhanSuSubTab === 'quanLy' ? "Tìm theo tên quản lý, số điện thoại, email..." : "Tìm theo tên nhân công, vị trí (Bảo vệ, Tạp vụ)..."}
                value={nhanSuSearchKeyword}
                onChange={(e) => setNhanSuSearchKeyword(e.target.value)}
                className={`droplet-pill ${styles.searchInput}`}
              />
            </div>

            {/* Nút Thêm Quản Lý hoặc Thêm Nhân Công */}
            {nhanSuSubTab === 'quanLy' ? (
              <button
                onClick={() => setShowAddQuanLyModal(true)}
                className={`droplet-pill droplet-pill-mint ${styles.btnActionMint}`}
              >
                <Plus size={17} />
                <span>Thêm Cán Bộ Quản Lý</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddNhanCongModal(true)}
                className={`droplet-pill droplet-pill-mint ${styles.btnActionMint}`}
              >
                <Plus size={17} />
                <span>Thêm Nhân Công Khác</span>
              </button>
            )}
          </div>

          {/* MỤC CON 1: CÁN BỘ QUẢN LÝ */}
          {nhanSuSubTab === 'quanLy' && (
            loadingNhanSu ? (
              <div className={`droplet-card ${styles.loadingCard}`}>
                <RefreshCw size={28} className={`animate-spin ${styles.loadingSpinnerSmall}`} />
                <p>Đang nạp danh sách ban quản lý cơ sở...</p>
              </div>
            ) : (
              <div className={styles.userGrid}>
                {filteredQuanLy.map((ql) => (
                  <div 
                    key={ql.idQly}
                    className={`droplet-card ${styles.userCard}`}
                  >
                    <div className={styles.userCardHeader}>
                      <div className={`droplet-circle ${styles.userIconGreen}`}>
                        <ShieldCheck size={26} />
                      </div>
                      <div>
                        <h3 className={styles.userName}>
                          {ql.hoTen}
                        </h3>
                        <span className={`badge badge-success ${styles.badgeMargin}`}>
                          Quản Lý Cơ Sở
                        </span>
                      </div>
                    </div>

                    <div className={styles.userContact}>
                      <div className={styles.userContactItem}>
                        <Phone size={15} className={styles.iconBlue} />
                        <span className={styles.contactPhoneText}>{ql.sdt || 'Chưa có SĐT'}</span>
                      </div>
                      <div className={styles.userContactItem}>
                        <Mail size={15} className={styles.iconBlue} />
                        <span>{ql.email || 'Chưa có email'}</span>
                      </div>
                      <div className={styles.userSalaryItem}>
                        <Banknote size={15} className={styles.iconGreen} />
                        <span className={styles.salaryLabel}>Mức lương:</span>
                        <strong className={styles.userSalaryVal}>
                          {ql.mucLuong != null ? Number(ql.mucLuong).toLocaleString('vi-VN') : '0'} đ
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Thẻ Thêm Quản Lý */}
                <div
                  onClick={() => setShowAddQuanLyModal(true)}
                  className={`droplet-card ${styles.addWorkerCardGreen}`}
                >
                  <div className={`droplet-circle ${styles.addWorkerCircleGreen}`}>
                    <Plus size={24} />
                  </div>
                  <span className={styles.addWorkerTextGreen}>+ Thêm Cán Bộ Quản Lý</span>
                </div>
              </div>
            )
          )}

          {/* MỤC CON 2: NHÂN CÔNG KHÁC */}
          {nhanSuSubTab === 'nhanCong' && (
            loadingNhanSu ? (
              <div className={`droplet-card ${styles.loadingCard}`}>
                <RefreshCw size={28} className={`animate-spin ${styles.loadingSpinnerSmall}`} />
                <p>Đang nạp danh sách nhân sự hỗ trợ...</p>
              </div>
            ) : (
              <div className={styles.userGrid}>
                {filteredNhanCong.map((nc) => (
                  <div 
                    key={nc.idNhanCongKhac}
                    className={`droplet-card ${styles.userCard}`}
                  >
                    <div className={styles.userCardHeader}>
                      <div className={`droplet-circle ${styles.userIconAmber}`}>
                        <Wrench size={24} />
                      </div>
                      <div>
                        <h3 className={styles.userName}>
                          {nc.hoTen}
                        </h3>
                        <span className={`badge badge-info ${styles.badgeMargin}`}>
                          {nc.viTriCongViec || 'Nhân viên hỗ trợ cơ sở'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.userContact}>
                      <div className={styles.userContactItem}>
                        <Phone size={15} className={styles.iconGreen} />
                        <span className={styles.contactPhoneText}>{nc.sdt || 'Chưa có SĐT'}</span>
                      </div>
                      <div className={styles.userContactItem}>
                        <Mail size={15} className={styles.iconBlue} />
                        <span>{nc.email || 'Chưa có email'}</span>
                      </div>
                      <div className={styles.userSalaryItem}>
                        <Banknote size={15} className={styles.iconGreen} />
                        <span className={styles.salaryLabel}>Mức lương:</span>
                        <strong className={styles.userSalaryVal}>
                          {nc.mucLuong != null ? Number(nc.mucLuong).toLocaleString('vi-VN') : '0'} đ
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Thẻ Thêm Nhân Công Khác */}
                <div
                  onClick={() => setShowAddNhanCongModal(true)}
                  className={`droplet-card ${styles.addWorkerCardAmber}`}
                >
                  <div className={`droplet-circle ${styles.addWorkerCircleAmber}`}>
                    <Plus size={24} />
                  </div>
                  <span className={styles.addWorkerTextAmber}>+ Thêm Nhân Công Khác</span>
                </div>
              </div>
            )
          )}

          {/* MODAL THÊM QUẢN LÝ */}
          <ModalWrapper
            isOpen={showAddQuanLyModal}
            onClose={() => setShowAddQuanLyModal(false)}
            maxWidth="max-w-[480px]"
            title={
              <div className={styles.modalHeader}>
                <div className={`droplet-circle ${styles.modalIcon} ${styles.modalIconGreen}`}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Thêm Cán Bộ Quản Lý</h3>
                  <p className={styles.modalSubtitle}>Cơ sở: <strong>{selectedBranch.tenCn}</strong></p>
                </div>
              </div>
            }
          >
            <form onSubmit={handleCreateQuanLy} className={styles.form}>
              {quanLyError && <div className={styles.errorAlert}>{quanLyError}</div>}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Họ Và Tên Quản Lý *</label>
                <input type="text" required placeholder="VD: Nguyễn Văn Quản Lý" value={newQuanLyData.hoTen} onChange={(e) => setNewQuanLyData({ ...newQuanLyData, hoTen: e.target.value })} className={`droplet-pill ${styles.formInput}`} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số Điện Thoại</label>
                <input type="text" placeholder="VD: 0912345678" value={newQuanLyData.sdt} onChange={(e) => setNewQuanLyData({ ...newQuanLyData, sdt: e.target.value })} className={`droplet-pill ${styles.formInput}`} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Liên Hệ</label>
                <input type="email" placeholder="VD: quanly@trungtam.edu.vn" value={newQuanLyData.email} onChange={(e) => setNewQuanLyData({ ...newQuanLyData, email: e.target.value })} className={`droplet-pill ${styles.formInput}`} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mức Lương (VNĐ)</label>
                <input type="number" min="0" step="100000" placeholder="VD: 15000000" value={newQuanLyData.mucLuong} onChange={(e) => setNewQuanLyData({ ...newQuanLyData, mucLuong: e.target.value })} className={`droplet-pill ${styles.formInput}`} />
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowAddQuanLyModal(false)} className={`droplet-pill ${styles.btnCancel}`}>Hủy</button>
                <button type="submit" disabled={submittingQuanLy} className={`droplet-pill droplet-pill-mint ${styles.btnSubmit}`}>
                  {submittingQuanLy && <RefreshCw size={15} className="animate-spin" />}
                  <span>{submittingQuanLy ? 'Đang lưu...' : 'Lưu Quản Lý'}</span>
                </button>
              </div>
            </form>
          </ModalWrapper>

          {/* MODAL THÊM NHÂN CÔNG KHÁC */}
          <ModalWrapper
            isOpen={showAddNhanCongModal}
            onClose={() => setShowAddNhanCongModal(false)}
            maxWidth="max-w-[480px]"
            title={
              <div className={styles.modalHeader}>
                <div className={`droplet-circle ${styles.modalIcon} ${styles.modalIconAmber}`}>
                  <Wrench size={24} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>Thêm Nhân Công Khác</h3>
                  <p className={styles.modalSubtitle}>Cơ sở: <strong>{selectedBranch.tenCn}</strong></p>
                </div>
              </div>
            }
          >
            <form onSubmit={handleCreateNhanCong} className={styles.form}>
              {nhanCongError && <div className={styles.errorAlert}>{nhanCongError}</div>}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Họ Và Tên *</label>
                <input type="text" required placeholder="VD: Trần Văn An" value={newNhanCongData.hoTen} onChange={(e) => setNewNhanCongData({ ...newNhanCongData, hoTen: e.target.value })} className={`droplet-pill ${styles.formInput}`} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Vị Trí Công Việc</label>
                <input type="text" placeholder="VD: Bảo vệ, Tạp vụ, Kỹ thuật điện máy..." value={newNhanCongData.viTriCongViec} onChange={(e) => setNewNhanCongData({ ...newNhanCongData, viTriCongViec: e.target.value })} className={`droplet-pill ${styles.formInput}`} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số Điện Thoại</label>
                <input type="text" placeholder="VD: 0987654321" value={newNhanCongData.sdt} onChange={(e) => setNewNhanCongData({ ...newNhanCongData, sdt: e.target.value })} className={`droplet-pill ${styles.formInput}`} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mức Lương (VNĐ)</label>
                <input type="number" min="0" step="100000" placeholder="VD: 7000000" value={newNhanCongData.mucLuong} onChange={(e) => setNewNhanCongData({ ...newNhanCongData, mucLuong: e.target.value })} className={`droplet-pill ${styles.formInput}`} />
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowAddNhanCongModal(false)} className={`droplet-pill ${styles.btnCancel}`}>Hủy</button>
                <button type="submit" disabled={submittingNhanCong} className={`droplet-pill droplet-pill-mint ${styles.btnSubmit}`}>
                  {submittingNhanCong && <RefreshCw size={15} className="animate-spin" />}
                  <span>{submittingNhanCong ? 'Đang lưu...' : 'Lưu Nhân Sự'}</span>
                </button>
              </div>
            </form>
          </ModalWrapper>

        </div>
      )}

    </div>
  );
};

export default TrangChiNhanh;


