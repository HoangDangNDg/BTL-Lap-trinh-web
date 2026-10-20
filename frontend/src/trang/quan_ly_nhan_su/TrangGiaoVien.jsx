import React, { useReducer, useEffect, useCallback } from 'react';
import { 
  UserCheck, 
  Search, 
  RefreshCw, 
  Phone, 
  Mail, 
  Calendar, 
  Building2, 
  Grid, 
  List as ListIcon, 
  MapPin, 
  X, 
  ExternalLink, 
  Users, 
  ArrowLeft, 
  ChevronRight, 
  Layers, 
  Compass,
  CheckCircle2,
  Plus,
  UserPlus,
  CreditCard,
  GraduationCap,
  Image as ImageIcon,
  UserCheck2,
  Check,
  Lock,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  FileSpreadsheet
} from 'lucide-react';
import { LiquidGlassTabs } from '../../components/ui/liquid-glass-button';
import { dichVuNhanSu } from '../../dich_vu/tao_tu_dong/dichVuNhanSu';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import ChiTietGiaoVienModal from '../../thanh_phan/giao_vien/ChiTietGiaoVienModal';
import ModalNhapGiaoVienHangLoat from '../../thanh_phan/giao_vien/ModalNhapGiaoVienHangLoat';
import ModalWrapper from '../../thanh_phan/ModalWrapper';
import styles from './TrangGiaoVien.module.css';

// ── KHỞI TẠO STATE & REDUCER QUẢN LÝ HỒ SƠ GIÁO VIÊN ──
const initialGiaoVienState = {
  selectedBranch: null,
  chiNhanhs: [],
  loadingBranches: true,
  giaoViens: [],
  loadingTeachers: false,
  selectedGv: null,

  showAddTeacherModal: false,
  showBulkModal: false,
  addMode: 'search',
  submittingTeacher: false,
  teacherError: '',
  teacherSuccess: '',

  searchPhoneInput: '',
  searchingPhone: false,
  hasSearchedPhone: false,
  searchPhoneResults: [],
  assigningTeacherId: null,

  newTeacherData: {
    hoTen: '',
    sdt: '',
    email: '',
    gioiTinh: 'M',
    ngaySinh: '',
    trinhDo: 'Cử nhân Sư phạm',
    cccd: '',
    diaChi: '',
    urlAnh: '',
    idCn: '',
    createAccount: true,
    tenDangNhap: '',
    matKhau: '',
    showPassword: false
  },

  viewMode: 'grid',
  teacherSearchKeyword: '',
  selectedGender: '',
  selectedStatus: ''
};

function giaoVienReducer(state, action) {
  switch (action.type) {
    case 'FETCH_BRANCHES_START':
      return { ...state, loadingBranches: true };
    case 'FETCH_BRANCHES_SUCCESS':
      return { ...state, loadingBranches: false, chiNhanhs: action.payload };
    case 'FETCH_BRANCHES_FAILURE':
      return { ...state, loadingBranches: false, chiNhanhs: [] };

    case 'FETCH_TEACHERS_START':
      return { ...state, loadingTeachers: true };
    case 'FETCH_TEACHERS_SUCCESS':
      return { ...state, loadingTeachers: false, giaoViens: action.payload };
    case 'FETCH_TEACHERS_FAILURE':
      return { ...state, loadingTeachers: false, giaoViens: [] };

    case 'SELECT_BRANCH':
      return {
        ...state,
        selectedBranch: action.payload,
        teacherSearchKeyword: '',
        selectedGender: '',
        selectedStatus: ''
      };

    case 'SELECT_GV':
      return { ...state, selectedGv: action.payload };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_TEACHER_KEYWORD':
      return { ...state, teacherSearchKeyword: action.payload };

    case 'SET_GENDER':
      return { ...state, selectedGender: action.payload };

    case 'SET_STATUS':
      return { ...state, selectedStatus: action.payload };

    case 'RESET_FILTERS':
      return { ...state, teacherSearchKeyword: '', selectedGender: '', selectedStatus: '' };

    case 'OPEN_ADD_TEACHER_MODAL':
      return {
        ...state,
        teacherError: '',
        teacherSuccess: '',
        addMode: 'search',
        searchPhoneInput: '',
        searchPhoneResults: [],
        hasSearchedPhone: false,
        showAddTeacherModal: true,
        newTeacherData: {
          hoTen: '',
          sdt: '',
          email: '',
          gioiTinh: 'M',
          ngaySinh: '',
          trinhDo: 'Cử nhân Sư phạm',
          cccd: '',
          diaChi: '',
          urlAnh: '',
          idCn: state.selectedBranch?.idCn !== 'ALL' 
            ? String(state.selectedBranch?.idCn || '') 
            : (state.chiNhanhs[0]?.idCn ? String(state.chiNhanhs[0].idCn) : ''),
          createAccount: true,
          tenDangNhap: '',
          matKhau: '',
          showPassword: false
        }
      };

    case 'CLOSE_ADD_TEACHER_MODAL':
      return { ...state, showAddTeacherModal: false };

    case 'SET_SHOW_BULK_MODAL':
      return { ...state, showBulkModal: action.payload };

    case 'SET_ADD_MODE':
      return { ...state, addMode: action.payload, teacherError: '', teacherSuccess: '' };

    case 'SET_TEACHER_ERROR':
      return { ...state, teacherError: action.payload, teacherSuccess: '', submittingTeacher: false };

    case 'SET_TEACHER_SUCCESS':
      return { ...state, teacherSuccess: action.payload, teacherError: '' };

    case 'SET_SUBMITTING_TEACHER':
      return { ...state, submittingTeacher: action.payload };

    case 'SEARCH_PHONE_START':
      return { ...state, searchingPhone: true, hasSearchedPhone: true, teacherError: '', teacherSuccess: '' };

    case 'SEARCH_PHONE_SUCCESS':
      return { ...state, searchingPhone: false, searchPhoneResults: action.payload };

    case 'SEARCH_PHONE_FAILURE':
      return { ...state, searchingPhone: false, searchPhoneResults: [], teacherError: action.payload };

    case 'SET_SEARCH_PHONE_INPUT':
      return { ...state, searchPhoneInput: action.payload };

    case 'SWITCH_TO_CREATE_WITH_PHONE':
      return {
        ...state,
        teacherError: '',
        addMode: 'create',
        newTeacherData: { ...state.newTeacherData, sdt: action.payload }
      };

    case 'SET_ASSIGNING_TEACHER_ID':
      return { ...state, assigningTeacherId: action.payload };

    case 'UPDATE_NEW_TEACHER_DATA':
      return {
        ...state,
        newTeacherData: typeof action.payload === 'function' 
          ? action.payload(state.newTeacherData) 
          : { ...state.newTeacherData, ...action.payload }
      };

    default:
      return state;
  }
}

const TrangGiaoVien = () => {
  const { user } = useTrangThaiXacThuc();

  const [state, dispatch] = useReducer(giaoVienReducer, initialGiaoVienState);
  const {
    selectedBranch,
    chiNhanhs,
    loadingBranches,
    giaoViens,
    loadingTeachers,
    selectedGv,
    showAddTeacherModal,
    showBulkModal,
    addMode,
    submittingTeacher,
    teacherError,
    teacherSuccess,
    searchPhoneInput,
    searchingPhone,
    hasSearchedPhone,
    searchPhoneResults,
    assigningTeacherId,
    newTeacherData,
    viewMode,
    teacherSearchKeyword,
    selectedGender,
    selectedStatus
  } = state;

  // Dispatch helpers
  const setSelectedBranch = (b) => dispatch({ type: 'SELECT_BRANCH', payload: b });
  const setSelectedGv = (gv) => dispatch({ type: 'SELECT_GV', payload: gv });
  const setShowBulkModal = (val) => dispatch({ type: 'SET_SHOW_BULK_MODAL', payload: val });
  const setShowAddTeacherModal = (val) => dispatch({ type: val ? 'OPEN_ADD_TEACHER_MODAL' : 'CLOSE_ADD_TEACHER_MODAL' });
  const setViewMode = (mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  const setTeacherSearchKeyword = (kw) => dispatch({ type: 'SET_TEACHER_KEYWORD', payload: kw });
  const setSelectedGender = (g) => dispatch({ type: 'SET_GENDER', payload: g });
  const setSelectedStatus = (s) => dispatch({ type: 'SET_STATUS', payload: s });
  const setTeacherError = (err) => dispatch({ type: 'SET_TEACHER_ERROR', payload: err });
  const setTeacherSuccess = (msg) => dispatch({ type: 'SET_TEACHER_SUCCESS', payload: msg });
  const setAddMode = (mode) => dispatch({ type: 'SET_ADD_MODE', payload: mode });
  const setSearchPhoneInput = (val) => dispatch({ type: 'SET_SEARCH_PHONE_INPUT', payload: val });
  const setNewTeacherData = (updater) => dispatch({ type: 'UPDATE_NEW_TEACHER_DATA', payload: updater });
  const setSubmittingTeacher = (val) => dispatch({ type: 'SET_SUBMITTING_TEACHER', payload: val });
  const setAssigningTeacherId = (id) => dispatch({ type: 'SET_ASSIGNING_TEACHER_ID', payload: id });

  const viewModeOptions = [
    { value: 'grid', label: 'Thẻ Giảng Viên', icon: <Grid size={16} /> },
    { value: 'table', label: 'Danh Sách Bảng', icon: <ListIcon size={16} /> }
  ];

  const addModeOptions = [
    { value: 'search', label: '1. Tìm Theo SĐT & Gán Vào Chi Nhánh', icon: <Phone size={15} /> },
    { value: 'create', label: '2. Nhập Tạo Mới Giáo Viên', icon: <UserPlus size={15} /> }
  ];

  // 1. Fetch Branches from Backend API
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

  // 2. Fetch Teachers based on Selected Branch
  const fetchTeachersByBranch = useCallback(async (branch) => {
    if (!branch) return;
    try {
      dispatch({ type: 'FETCH_TEACHERS_START' });
      let dataList = [];

      if (branch.idCn === 'ALL') {
        // Fetch All Teachers
        let res;
        if (user?.idDoanhNghiep && user?.vaiTro !== 'ADMIN') {
          res = await dichVuNhanSu.getGiaoVienTheoDoanhNghiep(user.idDoanhNghiep);
        } else {
          res = await dichVuNhanSu.getAllGiaoVien();
        }
        const items = res?.data !== undefined ? res.data : res;
        dataList = Array.isArray(items) ? items : [];
      } else {
        // Fetch Teachers by Branch ID via Backend API: /api/chi-nhanh/{idCn}/giao-vien
        const res = await dichVuNhanSu.getGiaoVienTheoChiNhanh(Number(branch.idCn));
        const items = res?.data !== undefined ? res.data : res;
        if (Array.isArray(items)) {
          dataList = items
            .map((item) => item.giaoVien || item)
            .filter((gv) => gv && gv.idGv);
        }
      }

      dispatch({ type: 'FETCH_TEACHERS_SUCCESS', payload: dataList });
    } catch (err) {
      console.error('Error fetching teachers for branch:', err);
      dispatch({ type: 'FETCH_TEACHERS_FAILURE' });
    }
  }, [user]);

  // Handle click on a Branch Node Card
  const handleSelectBranch = (branch) => {
    dispatch({ type: 'SELECT_BRANCH', payload: branch });
    fetchTeachersByBranch(branch);
  };

  // Filter Teachers for Step 2
  const filteredTeachers = giaoViens.filter((gv) => {
    if (teacherSearchKeyword.trim()) {
      const q = teacherSearchKeyword.toLowerCase();
      const matchName = (gv.hoTen || '').toLowerCase().includes(q);
      const matchPhone = (gv.sdt || '').toLowerCase().includes(q);
      const matchEmail = (gv.email || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }

    if (selectedGender) {
      const g = (gv.gioiTinh || '').toUpperCase();
      if (selectedGender === 'M' && g !== 'M' && g !== 'NAM') return false;
      if (selectedGender === 'F' && g !== 'F' && g !== 'NU' && g !== 'NỮ') return false;
    }

    if (selectedStatus) {
      if (selectedStatus === 'ACTIVE' && (gv.xoa || gv.conHoatDong === false)) return false;
      if (selectedStatus === 'INACTIVE' && (!gv.xoa && gv.conHoatDong !== false)) return false;
    }

    return true;
  });

  const handleResetTeacherFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const hasActiveTeacherFilters = teacherSearchKeyword || selectedGender || selectedStatus;

  const formatGender = (val) => {
    if (!val) return '-';
    const v = String(val).toUpperCase();
    if (v === 'M' || v === 'NAM') return 'Nam';
    if (v === 'F' || v === 'NU' || v === 'NỮ') return 'Nữ';
    return val;
  };

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      const parts = String(val).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return val;
    } catch {
      return val;
    }
  };

  // Mở modal thêm giáo viên
  const handleOpenAddTeacherModal = () => {
    dispatch({ type: 'OPEN_ADD_TEACHER_MODAL' });
  };

  // 1. Tìm kiếm giáo viên theo SĐT
  const handleSearchTeacherByPhone = async (e) => {
    if (e) e.preventDefault();
    const cleanSearchSdt = searchPhoneInput.trim().replace(/\D/g, '');
    if (!cleanSearchSdt) {
      setTeacherError('Vui lòng nhập số điện thoại cần tìm kiếm');
      return;
    }
    if (cleanSearchSdt.length < 10 || cleanSearchSdt.length > 11) {
      setTeacherError('Số điện thoại tra cứu phải bao gồm từ 10 đến 11 chữ số (VD: 0912345678)');
      return;
    }

    try {
      dispatch({ type: 'SEARCH_PHONE_START' });
      const res = await dichVuNhanSu.timKiemGiaoVienTheoSdt(cleanSearchSdt, user?.idDoanhNghiep);
      const list = res?.data !== undefined ? res.data : res;
      dispatch({ type: 'SEARCH_PHONE_SUCCESS', payload: Array.isArray(list) ? list : [] });
    } catch (err) {
      console.error('Error searching teacher by phone:', err);
      dispatch({
        type: 'SEARCH_PHONE_FAILURE',
        payload: err?.response?.data?.message || 'Lỗi khi tìm kiếm giáo viên theo số điện thoại'
      });
    }
  };

  // 2. Gán giáo viên có sẵn vào chi nhánh hiện tại
  const handleAssignTeacherToBranch = async (gv) => {
    setTeacherError('');
    setTeacherSuccess('');
    if (!gv?.idGv) return;
    if (!selectedBranch || selectedBranch.idCn === 'ALL') {
      setTeacherError('Vui lòng chọn một chi nhánh cụ thể để gán giáo viên');
      return;
    }

    try {
      setAssigningTeacherId(gv.idGv);
      await dichVuNhanSu.ganChiNhanh(gv.idGv, Number(selectedBranch.idCn));
      setTeacherSuccess(`Đã gán thành công giáo viên "${gv.hoTen}" vào ${selectedBranch.tenCn}!`);
      // Nạp lại danh sách giáo viên
      await fetchTeachersByBranch(selectedBranch);
    } catch (err) {
      console.error('Error assigning teacher to branch:', err);
      setTeacherError(err?.response?.data?.message || 'Giáo viên này đã có trong chi nhánh rồi hoặc không thể gán!');
    } finally {
      setAssigningTeacherId(null);
    }
  };

  // 3. Xử lý tạo giáo viên mới hoàn toàn
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setTeacherError('');
    setTeacherSuccess('');
    if (!newTeacherData.hoTen.trim()) {
      setTeacherError('Vui lòng nhập họ và tên giáo viên');
      return;
    }

    const sdtInput = newTeacherData.sdt.trim();
    if (sdtInput) {
      const cleanSdt = sdtInput.replace(/\D/g, '');
      if (cleanSdt.length < 10 || cleanSdt.length > 11 || !/^[0-9]+$/.test(sdtInput)) {
        setTeacherError('Số điện thoại phải bao gồm từ 10 đến 11 chữ số (VD: 0912345678)');
        return;
      }
    }

    const cccdInput = newTeacherData.cccd.trim();
    if (cccdInput) {
      const cleanCccd = cccdInput.replace(/\D/g, '');
      if (cleanCccd.length !== 12 || !/^[0-9]+$/.test(cccdInput)) {
        setTeacherError('Số căn cước công dân (CCCD) phải bao gồm đúng 12 chữ số (VD: 079123456789)');
        return;
      }
    }

    // Kiểm tra thông tin tài khoản nếu chọn tạo tài khoản (Tài khoản = Số điện thoại)
    if (newTeacherData.createAccount) {
      if (!sdtInput) {
        setTeacherError('Vui lòng nhập số điện thoại của giáo viên để làm tên đăng nhập tài khoản');
        return;
      }
      const p = (newTeacherData.matKhau || '').trim();
      if (!p) {
        setTeacherError('Vui lòng tự nhập mật khẩu cho tài khoản giáo viên');
        return;
      }
      if (p.length < 6) {
        setTeacherError('Mật khẩu tự nhập phải có ít nhất 6 ký tự');
        return;
      }
    }

    try {
      setSubmittingTeacher(true);
      const idDn = user?.idDoanhNghiep || 1;

      // 1. Tạo Giáo Viên qua API Backend
      const payloadGv = {
        hoTen: newTeacherData.hoTen.trim(),
        sdt: sdtInput || undefined,
        email: newTeacherData.email.trim() || undefined,
        gioiTinh: newTeacherData.gioiTinh || 'M',
        ngaySinh: newTeacherData.ngaySinh || undefined,
        xoa: false
      };

      const resGv = await dichVuNhanSu.createGiaoVien(idDn, payloadGv);
      const createdGv = resGv?.data !== undefined ? resGv.data : resGv;
      const newIdGv = createdGv?.idGv;

      if (newIdGv) {
        // 2. Gán vào chi nhánh
        const targetBranchId = newTeacherData.idCn || (selectedBranch?.idCn !== 'ALL' ? selectedBranch?.idCn : null);
        if (targetBranchId && targetBranchId !== 'ALL') {
          try {
            await dichVuNhanSu.ganChiNhanh(newIdGv, Number(targetBranchId));
          } catch (e) {
            console.warn('Could not assign branch to teacher:', e);
          }
        }

        // 3. Tạo chi tiết hồ sơ (CCCD, trình độ, địa chỉ, ảnh đại diện)
        if (newTeacherData.trinhDo || newTeacherData.cccd || newTeacherData.diaChi || newTeacherData.urlAnh) {
          try {
            await dichVuNhanSu.createChiTietGv(newIdGv, {
              trinhDo: newTeacherData.trinhDo || undefined,
              cccd: newTeacherData.cccd ? Number(newTeacherData.cccd) : undefined,
              diaChi: newTeacherData.diaChi || undefined,
              urlAnh: newTeacherData.urlAnh || undefined,
              ngayVaoLam: new Date().toISOString().split('T')[0]
            });
          } catch (e) {
            console.warn('Could not create extra details for teacher:', e);
          }
        }

        // 4. Tạo tài khoản đăng nhập cho giáo viên nếu được chọn (Tài khoản = Số điện thoại)
        if (newTeacherData.createAccount && sdtInput) {
          try {
            await dichVuNhanSu.createTaiKhoanGv(newIdGv, {
              tenDangNhap: sdtInput,
              matKhau: newTeacherData.matKhau.trim()
            });
          } catch (e) {
            console.warn('Could not create account for teacher:', e);
            const accErr = e?.response?.data?.message;
            if (accErr) {
              setTeacherError(`Đã tạo giáo viên nhưng tạo tài khoản thất bại: ${accErr}`);
              await fetchTeachersByBranch(selectedBranch);
              return;
            }
          }
        }
      }

      setShowAddTeacherModal(false);
      // Nạp lại danh sách giáo viên hiện tại
      await fetchTeachersByBranch(selectedBranch);
    } catch (err) {
      console.error('Error creating teacher:', err);
      const msg = err?.response?.data?.message;
      setTeacherError(msg || 'Không thể thêm giáo viên. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setSubmittingTeacher(false);
    }
  };

  // =========================================================================
  // GIAO DIỆN 1: KHI VÀO TRANG SẼ HIỆN RA CÁC KHỐI CHI NHÁNH CƠ SỞ
  // =========================================================================
  if (!selectedBranch) {
    return (
      <div className={styles.container}>
        
        {/* Header Banner Các Khối Chi Nhánh */}
        <div className={`droplet-card ${styles.headerBanner}`}>
          <div className={styles.headerInfo}>
            <div className={`droplet-circle ${styles.headerIcon}`}>
              <Compass size={28} />
            </div>
            <div>
              <h2 className={styles.headerTitle}>
                Trung Tâm Quản Lý & Phân Phối Đội Ngũ Giáo Viên
              </h2>
              <p className={styles.headerSubtitle}>
                Chọn một chi nhánh cơ sở bên dưới để xem danh sách và tra cứu hồ sơ giáo viên đang giảng dạy
              </p>
            </div>
          </div>

          <button
            onClick={fetchBranches}
            className={`droplet-pill ${styles.btnRefreshBranch}`}
          >
            <RefreshCw size={16} className={loadingBranches ? 'animate-spin' : ''} />
            <span>Làm mới chi nhánh</span>
          </button>
        </div>

        {/* LƯỚI CÁC NODE CHI NHÁNH */}
        {loadingBranches ? (
          <div className={`droplet-card ${styles.loadingCard}`}>
            <RefreshCw size={32} className={`animate-spin ${styles.loadingSpinner}`} />
            <p className={styles.loadingText}>Đang nạp danh sách các chi nhánh từ hệ thống...</p>
          </div>
        ) : (
          <div className={styles.branchGrid}>
            {/* NODE 1: TẤT CẢ CHI NHÁNH (Toàn hệ thống) */}
            <div
              onClick={() => handleSelectBranch({ idCn: 'ALL', tenCn: 'Tất Cả Chi Nhánh (Toàn Hệ Thống)', diaChi: 'Toàn bộ các cơ sở trung tâm' })}
              className={`droplet-card ${styles.allBranchCard}`}
            >
              <div>
                <div className={styles.allBranchTop}>
                  <div className={`droplet-circle ${styles.allBranchIcon}`}>
                    <Layers size={26} />
                  </div>
                  <span className={`badge badge-success ${styles.allBranchBadge}`}>
                    Toàn Hệ Thống
                  </span>
                </div>

                <div className={styles.allBranchBody}>
                  <h3 className={styles.allBranchTitle}>
                    Tất Cả Chi Nhánh
                  </h3>
                  <p className={styles.allBranchDesc}>
                    Xem toàn bộ đội ngũ giáo viên, giảng viên và chuyên viên đào tạo trên khắp các cơ sở.
                  </p>
                </div>
              </div>

              <div className={styles.allBranchFooter}>
                <span>Truy Cập Toàn Bộ Giáo Viên</span>
                <ChevronRight size={18} />
              </div>
            </div>

            {/* CÁC NODE CHI NHÁNH TỪ API */}
            {chiNhanhs.map((cn) => (
              <div
                key={cn.idCn}
                onClick={() => handleSelectBranch(cn)}
                className={`droplet-card ${styles.branchNodeCard}`}
              >
                <div>
                  <div className={styles.branchNodeTop}>
                    <div className={`droplet-circle ${styles.branchNodeIcon}`}>
                      <Building2 size={24} />
                    </div>
                    <span className={`badge badge-info ${styles.branchNodeBadge}`}>
                      Chi nhánh
                    </span>
                  </div>

                  <div className={styles.branchNodeBody}>
                    <h3 className={styles.branchNodeTitle}>
                      {cn.tenCn}
                    </h3>
                    <div className={styles.branchNodeAddress}>
                      <MapPin size={15} className={styles.mapPinIcon} />
                      <span className={styles.addressText}>{cn.diaChi || 'Cơ sở đào tạo chuẩn'}</span>
                    </div>
                  </div>

                  <div className={styles.branchNodeContacts}>
                    {cn.sdt && (
                      <div className={styles.contactRow}>
                        <Phone size={14} className={styles.phoneIcon} />
                        <span>{cn.sdt}</span>
                      </div>
                    )}
                    {cn.email && (
                      <div className={styles.contactRow}>
                        <Mail size={14} className={styles.mailIcon} />
                        <span>{cn.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.branchNodeFooter}>
                  <span className={styles.branchActionText}>Xem Giáo Viên Chi Nhánh Này</span>
                  <ChevronRight size={18} className={styles.branchActionIcon} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // GIAO DIỆN 3: KHI ĐANG XEM HỒ SƠ CHI TIẾT GIÁO VIÊN ĐƯỢC CHỌN
  // =========================================================================
  if (selectedGv) {
    return (
      <ChiTietGiaoVienModal
        giaoVien={selectedGv}
        onClose={() => setSelectedGv(null)}
      />
    );
  }

  // =========================================================================
  // GIAO DIỆN 2: MÀN HÌNH DANH SÁCH GIÁO VIÊN CỦA CHI NHÁNH ĐÃ CHỌN
  // =========================================================================
  return (
    <div className={styles.containerDetail}>
      {/* 1. Header Navigation & Filter Panel Hợp Nhất (Single Unified Action Panel) */}
      <div className={`droplet-card ${styles.navPanel}`}>
        {/* HÀNG 1: Thông tin Chi Nhánh & Các Nút Tác Vụ Chính */}
        <div className={styles.navRowTop}>
          {/* Cụm Chi Nhánh */}
          <div className={styles.branchInfoCluster}>
            {/* Nút Quay lại chọn chi nhánh */}
            <button
              onClick={() => setSelectedBranch(null)}
              className={`droplet-pill droplet-pill-mint ${styles.btnBack}`}
              title="Quay lại chọn chi nhánh khác"
            >
              <ArrowLeft size={18} />
            </button>

            <div className={styles.branchTextGroup}>
              <div className={styles.branchTitleFlex}>
                <h2 className={styles.branchHeading}>
                  {selectedBranch.tenCn}
                </h2>
              </div>
              <p className={styles.branchSubheading}>
                {selectedBranch.diaChi || 'Danh sách các giảng viên thuộc cơ sở'}
              </p>
            </div>
          </div>

          {/* Cụm Action Buttons: Thêm GV, Nhập Excel, Switch View, Làm mới */}
          <div className={styles.actionButtonsCluster}>
            {/* NÚT THÊM GIÁO VIÊN */}
            <button
              onClick={handleOpenAddTeacherModal}
              className={`droplet-pill droplet-pill-mint ${styles.btnAddTeacher}`}
            >
              <Plus size={16} />
              <span>Thêm Giáo Viên</span>
            </button>

            {/* NÚT NHẬP EXCEL HÀNG LOẠT */}
            <button
              onClick={() => setShowBulkModal(true)}
              className={`droplet-pill ${styles.btnBulkExcel}`}
            >
              <FileSpreadsheet size={16} className={styles.excelIcon} />
              <span>Nhập Excel Hàng Loạt</span>
            </button>

            {/* BỘ CHUYỂN ĐỔI CHẾ ĐỘ XEM: CHỈ DÙNG ICON (Thẻ / Bảng), HOVER ĐỔI MÀU XANH */}
            <div className={`droplet-pill ${styles.viewModePill}`}>
              {/* Nút Xem Dạng Thẻ */}
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Chế độ xem thẻ giảng viên"
                className={`view-mode-icon-btn ${styles.viewModeBtn} ${viewMode === 'grid' ? styles.viewModeBtnActive : ''}`}
              >
                <Grid size={17} />
              </button>

              {/* Nút Xem Dạng Bảng */}
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Chế độ xem danh sách bảng"
                className={`view-mode-icon-btn ${styles.viewModeBtn} ${viewMode === 'table' ? styles.viewModeBtnActive : ''}`}
              >
                <ListIcon size={17} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchTeachersByBranch(selectedBranch)}
              className={`droplet-circle refresh-btn-green-hover ${styles.btnRefreshTeacher}`}
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={16} className={loadingTeachers ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ĐƯỜNG PHÂN CÁCH MỜ NHẸ (Subtle Divider) */}
        <div className={styles.subtleDivider} />

        {/* HÀNG 2: Thanh Tìm Kiếm, Bộ Lọc & Thống Kê Số Lượng */}
        <div className={styles.navRowBottom}>
          {/* Nhóm tìm kiếm & lọc thu gọn */}
          <div className={styles.filtersGroup}>
            {/* Ô Tìm Kiếm (Thu gọn 250px) */}
            <div className={styles.searchWrapper}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm tên, SĐT, email..."
                value={teacherSearchKeyword}
                onChange={(e) => setTeacherSearchKeyword(e.target.value)}
                className={`droplet-pill ${styles.searchInput}`}
              />
            </div>

            {/* Lọc Giới Tính (Thu gọn 135px) */}
            <div className={styles.selectGenderWrapper}>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className={`droplet-pill ${styles.filterSelect}`}
              >
                <option value="">Tất cả giới tính</option>
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
              </select>
            </div>

            {/* Lọc Trạng Thái (Thu gọn 150px) */}
            <div className={styles.selectStatusWrapper}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`droplet-pill ${styles.filterSelect}`}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang công tác</option>
                <option value="INACTIVE">Nghỉ việc</option>
              </select>
            </div>

            {/* Nút Reset bộ lọc */}
            {hasActiveTeacherFilters && (
              <button
                onClick={handleResetTeacherFilters}
                className={`droplet-pill ${styles.btnResetFilter}`}
              >
                <X size={14} />
                <span>Xóa lọc</span>
              </button>
            )}
          </div>

          {/* Thông tin số lượng tinh gọn bên phải */}
          <div className={styles.statsMeta}>
            <span>
              Tìm thấy: <strong className={styles.statsMetaBlue}>{filteredTeachers.length}</strong> / {giaoViens.length} GV
            </span>
            <span className={styles.statsMetaDivider} />
            <span className={styles.statsMetaSub}>
              Đang công tác: <strong className={styles.statsMetaGreen}>{giaoViens.filter(g => !g.xoa && g.conHoatDong !== false).length}</strong> • Nghỉ: <strong>{giaoViens.filter(g => g.xoa || g.conHoatDong === false).length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Content View (Grid or Table) */}
      {loadingTeachers ? (
        <div className={`droplet-card ${styles.loadingCard}`}>
          <RefreshCw size={32} className={`animate-spin ${styles.loadingSpinner}`} />
          <p className={styles.loadingText}>Đang nạp danh sách giáo viên của chi nhánh...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className={`droplet-card ${styles.emptyStateCard}`}>
          <Users size={48} className={styles.emptyStateIcon} />
          <div>
            <h4 className={styles.emptyStateTitle}>
              Chưa có giáo viên nào tại chi nhánh này
            </h4>
            <p className={styles.emptyStateDesc}>
              Hãy tìm theo SĐT để gán hoặc nhập tạo mới giáo viên vào cơ sở này.
            </p>
          </div>
          <button
            onClick={handleOpenAddTeacherModal}
            className={`droplet-pill droplet-pill-mint ${styles.btnEmptyAdd}`}
          >
            <Plus size={18} />
            <span>Thêm Giáo Viên Đầu Tiên</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: Teacher Droplet Cards (Click vào thẻ sẽ mở chi tiết) */
        <div className={styles.teacherGrid}>
          {filteredTeachers.map((gv) => {
            const isActive = !gv.xoa && gv.conHoatDong !== false;
            return (
              <div 
                key={gv.idGv}
                onClick={() => setSelectedGv(gv)}
                className={`droplet-card teacher-card-node ${styles.teacherCard}`}
              >
                {/* Header: Avatar, Tên GV, Mã GV và Chấm tròn trạng thái duy nhất */}
                <div className={styles.teacherCardHeader}>
                  <div className={styles.teacherAvatarRow}>
                    <div className={`droplet-circle teacher-avatar-circle ${styles.teacherAvatar}`}>
                      {gv.hoTen ? gv.hoTen.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : 'GV'}
                    </div>
                    <div>
                      <h3 className={styles.teacherName}>
                        {gv.hoTen}
                      </h3>
                      <span className={styles.teacherRole}>
                        Giáo viên giảng dạy
                      </span>
                    </div>
                  </div>

                  {/* Chấm tròn trạng thái duy nhất ở góc: Xanh nếu còn hoạt động, Xám nếu đã rời */}
                  <div 
                    title={isActive ? "Còn hoạt động (1)" : "Đã rời (0)"}
                    className={styles.statusDotWrapper}
                  >
                    <span className={`${styles.statusDot} ${isActive ? styles.statusDotActive : styles.statusDotInactive}`} />
                  </div>
                </div>

                {/* Các trường thông tin - Icon cùng màu xám tối nhẹ, khoảng trống thoáng đãng */}
                <div className={styles.teacherCardFields}>
                  <div className={styles.teacherFieldRowPhone}>
                    <Phone size={14} className={styles.fieldIcon} />
                    <span>{gv.sdt || 'Chưa có SĐT'}</span>
                  </div>

                  <div className={styles.teacherFieldRow}>
                    <Mail size={14} className={styles.fieldIcon} />
                    <span className={styles.ellipsisText}>
                      {gv.email || 'Chưa có email'}
                    </span>
                  </div>

                  <div className={styles.teacherFieldRow}>
                    <Calendar size={14} className={styles.fieldIcon} />
                    <span>{formatDate(gv.ngaySinh)} • Giới tính: {formatGender(gv.gioiTinh)}</span>
                  </div>

                  <div className={styles.teacherFieldRow}>
                    <Building2 size={14} className={styles.fieldIcon} />
                    <span className={styles.ellipsisText}>
                      {gv.doanhNghiep?.tenDn || selectedBranch?.tenCn || 'Trung tâm đào tạo'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Card thêm giáo viên nhanh trong lưới */}
          <div
            onClick={handleOpenAddTeacherModal}
            className={`droplet-card ${styles.addTeacherCardQuick}`}
          >
            <div className={`droplet-circle ${styles.addTeacherCircle}`}>
              <Plus size={30} />
            </div>
            <div className={styles.textCenter}>
              <h3 className={styles.addTeacherTitle}>
                Thêm Giáo Viên Mới
              </h3>
              <p className={styles.addTeacherDesc}>
                Tìm qua SĐT hoặc nhập tạo mới vào chi nhánh
              </p>
            </div>
          </div>

          {/* Card nhập giáo viên hàng loạt bằng Excel trong lưới */}
          <div
            onClick={() => setShowBulkModal(true)}
            className={`droplet-card ${styles.bulkTeacherCardQuick}`}
          >
            <div className={`droplet-circle ${styles.bulkTeacherCircle}`}>
              <FileSpreadsheet size={28} />
            </div>
            <div className={styles.textCenter}>
              <h3 className={styles.bulkTeacherTitle}>
                Nhập Hàng Loạt Bằng Excel
              </h3>
              <p className={styles.bulkTeacherDesc}>
                Tải file Excel hoặc nhập bảng thủ công (Batch 50)
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* TABLE VIEW: Professional Dense List */
        <div className={`droplet-card ${styles.tableCard}`}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.thStt}>STT</th>
                <th className={styles.th}>Họ Và Tên</th>
                <th className={styles.th}>Số Điện Thoại</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Giới Tính</th>
                <th className={styles.th}>Ngày Sinh</th>
                <th className={styles.th}>Đơn Vị</th>
                <th className={styles.th}>Trạng Thái</th>
                <th className={styles.thAction}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((gv, idx) => (
                <tr 
                  key={gv.idGv || idx} 
                  className={styles.tableBodyRow}
                  onClick={() => setSelectedGv(gv)}
                >
                  <td className={styles.tdStt}>
                    {idx + 1}
                  </td>
                  <td className={styles.tdName}>
                    {gv.hoTen}
                  </td>
                  <td className={styles.td}>
                    {gv.sdt || '-'}
                  </td>
                  <td className={styles.td}>
                    {gv.email || '-'}
                  </td>
                  <td className={styles.td}>
                    {formatGender(gv.gioiTinh)}
                  </td>
                  <td className={styles.td}>
                    {formatDate(gv.ngaySinh)}
                  </td>
                  <td className={styles.td}>
                    {gv.doanhNghiep?.tenDn || '-'}
                  </td>
                  <td className={styles.td}>
                    <span className={`badge ${gv.xoa ? 'badge-danger' : 'badge-success'}`}>
                      {gv.xoa ? 'Nghỉ việc' : 'Đang công tác'}
                    </span>
                  </td>
                  <td className={styles.tdAction}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGv(gv);
                      }}
                      className={`droplet-pill ${styles.btnViewDetail}`}
                    >
                      Chi Tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL THÊM GIÁO VIÊN VỚI 2 LỰA CHỌN (TÌM THEO SĐT HOẶC NHẬP TẠO MỚI)     */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL THÊM GIÁO VIÊN VỚI 2 LỰA CHỌN (TÌM THEO SĐT HOẶC NHẬP TẠO MỚI)     */}
      {/* ========================================================================= */}
      {showAddTeacherModal && (
        <div className={styles.modalOverlay}>
          <div className={`droplet-card ${styles.modalCard}`}>
            {/* Header Modal Cố Định */}
            <div className={styles.modalHeaderBar}>
              <div className={styles.modalHeader}>
                <div className={`droplet-circle ${styles.modalIcon}`}>
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>
                    Thêm Giáo Viên Vào Chi Nhánh
                  </h3>
                  <p className={styles.modalSubtitle}>
                    Cơ sở: <strong>{selectedBranch.tenCn}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTeacherModal(false)}
                className={`droplet-circle ${styles.btnCloseModal}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Thanh Tabs Cố Định & Thông Báo */}
            <div className={styles.modalTabsBar}>
              <div className={styles.tabCenter}>
                <LiquidGlassTabs
                  options={addModeOptions}
                  value={addMode}
                  onChange={(val) => {
                    setTeacherError('');
                    setTeacherSuccess('');
                    setAddMode(val);
                  }}
                  size="default"
                />
              </div>

              {/* Notification Messages */}
              {teacherError && (
                <div className={styles.errorBox}>
                  {teacherError}
                </div>
              )}
              {teacherSuccess && (
                <div className={styles.successBox}>
                  <Check size={15} />
                  <span>{teacherSuccess}</span>
                </div>
              )}
            </div>

            {/* LỰA CHỌN 1: TÌM KIẾM THEO SĐT & GÁN VÀO CHI NHÁNH */}
            {addMode === 'search' && (
              <div className={styles.modalContent}>
                <form onSubmit={handleSearchTeacherByPhone} className={styles.searchPhoneForm}>
                  <div className={styles.phoneInputWrapper}>
                    <Phone size={16} className={styles.phoneSearchIcon} />
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="Nhập SĐT giáo viên (10 - 11 chữ số)..."
                      value={searchPhoneInput}
                      onChange={(e) => setSearchPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className={`droplet-pill ${styles.phoneSearchInput}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={searchingPhone}
                    className={`droplet-pill droplet-pill-mint ${styles.btnSearchSubmit}`}
                  >
                    {searchingPhone ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                    <span>{searchingPhone ? 'Đang tìm...' : 'Tìm Kiếm'}</span>
                  </button>
                </form>

                {/* Kết quả tìm kiếm theo SĐT */}
                <div className={styles.searchResultsContainer}>
                  {searchingPhone ? (
                    <div className={styles.searchingPhoneState}>
                      <RefreshCw size={24} className={`animate-spin ${styles.searchingPhoneSpinner}`} />
                      <span className={styles.searchingPhoneText}>Đang tra cứu dữ liệu giáo viên theo SĐT...</span>
                    </div>
                  ) : hasSearchedPhone && searchPhoneResults.length === 0 ? (
                    <div className={styles.emptyPhoneResult}>
                      <p className={styles.emptyPhoneText}>
                        Không tìm thấy giáo viên nào có số điện thoại <strong>"{searchPhoneInput}"</strong> trong doanh nghiệp.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherError('');
                          setNewTeacherData(prev => ({ ...prev, sdt: searchPhoneInput }));
                          setAddMode('create');
                        }}
                        className={`droplet-pill ${styles.btnSwitchCreate}`}
                      >
                        + Chuyển sang Tạo Mới Giáo Viên Với SĐT Này
                      </button>
                    </div>
                  ) : searchPhoneResults.length > 0 ? (
                    <div className={styles.searchResultsList}>
                      <span className={styles.searchResultsLabel}>
                        Tìm thấy {searchPhoneResults.length} giáo viên phù hợp:
                      </span>
                      {searchPhoneResults.map((gv) => {
                        const isAlreadyInBranch = giaoViens.some(g => g.idGv === gv.idGv);
                        const isAssigning = assigningTeacherId === gv.idGv;

                        return (
                          <div
                            key={gv.idGv}
                            className={`droplet-pill ${styles.searchResultItem}`}
                          >
                            <div className={styles.searchResultLeft}>
                              <div className={`droplet-circle ${styles.searchResultAvatar}`}>
                                {gv.hoTen ? gv.hoTen.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : 'GV'}
                              </div>
                              <div>
                                <div className={styles.searchResultNameRow}>
                                  <h4 className={styles.searchResultName}>
                                    {gv.hoTen}
                                  </h4>
                                </div>
                                <div className={styles.searchResultMeta}>
                                  <span>SĐT: <strong className={styles.phoneHighlight}>{gv.sdt || '-'}</strong></span>
                                  <span>•</span>
                                  <span>Email: {gv.email || '-'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              {isAlreadyInBranch ? (
                                <span className={`badge badge-success ${styles.badgeAssigned}`}>
                                  <Check size={13} />
                                  <span>Đã có trong chi nhánh</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isAssigning}
                                  onClick={() => handleAssignTeacherToBranch(gv)}
                                  className={`droplet-pill droplet-pill-mint ${styles.btnAssign}`}
                                >
                                  {isAssigning && <RefreshCw size={13} className="animate-spin" />}
                                  <span>{isAssigning ? 'Đang gán...' : '+ Gán Vào Chi Nhánh Này'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.searchPromptBox}>
                      <div className={styles.searchPromptIcon}>
                        <Phone size={24} />
                      </div>
                      <div>
                        <h4 className={styles.searchPromptTitle}>
                          Tra Cứu Hồ Sơ Giáo Viên
                        </h4>
                        <p className={styles.searchPromptDesc}>
                          Nhập số điện thoại ở trên để kiểm tra xem giáo viên đã có trong hệ thống trung tâm hay chưa.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LỰA CHỌN 2: NHẬP THÔNG TIN TẠO MỚI HOÀN TOÀN GIÁO VIÊN */}
            {addMode === 'create' && (
              <form 
                onSubmit={handleCreateTeacher} 
                className={styles.createTeacherForm}
              >
                {/* Scrollable Form Body */}
                <div className={styles.createTeacherScrollBody}>
                  {/* Họ và tên */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Họ Và Tên Giáo Viên *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: ThS. Nguyễn Văn Hùng"
                      value={newTeacherData.hoTen}
                      onChange={(e) => setNewTeacherData({ ...newTeacherData, hoTen: e.target.value })}
                      className={`droplet-pill ${styles.formInput}`}
                    />
                  </div>

                  {/* SĐT & Email */}
                  <div className={styles.formGrid2}>
                    <div>
                      <div className={styles.formLabelBetween}>
                        <label className={styles.formLabel}>
                          Số Điện Thoại
                        </label>
                        <span className={styles.labelSubtext}>10 - 11 số</span>
                      </div>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="VD: 0912345678"
                        value={newTeacherData.sdt}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                          setNewTeacherData(prev => ({
                            ...prev,
                            sdt: val,
                            tenDangNhap: (!prev.tenDangNhap || prev.tenDangNhap.startsWith('gv_')) ? (val ? `gv_${val}` : '') : prev.tenDangNhap
                          }));
                        }}
                        className={`droplet-pill ${styles.formInput}`}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="VD: hung.nguyen@edu.vn"
                        value={newTeacherData.email}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, email: e.target.value })}
                        className={`droplet-pill ${styles.formInput}`}
                      />
                    </div>
                  </div>

                  {/* Giới tính & Ngày sinh */}
                  <div className={styles.formGrid2}>
                    <div>
                      <label className={styles.formLabel}>
                        Giới Tính
                      </label>
                      <select
                        value={newTeacherData.gioiTinh}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, gioiTinh: e.target.value })}
                        className={`droplet-pill ${styles.formSelect}`}
                      >
                        <option value="M">Nam</option>
                        <option value="F">Nữ</option>
                      </select>
                    </div>

                    <div>
                      <label className={styles.formLabel}>
                        Ngày Sinh
                      </label>
                      <input
                        type="date"
                        value={newTeacherData.ngaySinh}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, ngaySinh: e.target.value })}
                        className={`droplet-pill ${styles.formInput}`}
                      />
                    </div>
                  </div>

                  {/* Chi nhánh công tác & Trình độ */}
                  <div className={styles.formGrid2}>
                    <div>
                      <label className={styles.formLabel}>
                        Chi Nhánh Cơ Sở
                      </label>
                      <select
                        value={newTeacherData.idCn}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, idCn: e.target.value })}
                        className={`droplet-pill ${styles.formSelect}`}
                      >
                        <option value="">-- Không chọn chi nhánh --</option>
                        {chiNhanhs.map((cn) => (
                          <option key={cn.idCn} value={cn.idCn}>
                            {cn.tenCn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={styles.formLabel}>
                        Trình Độ Học Vấn
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Thạc sĩ Sư phạm, Cử nhân..."
                        value={newTeacherData.trinhDo}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, trinhDo: e.target.value })}
                        className={`droplet-pill ${styles.formInput}`}
                      />
                    </div>
                  </div>

                  {/* CCCD & Địa chỉ */}
                  <div className={styles.formGrid2}>
                    <div>
                      <div className={styles.formLabelBetween}>
                        <label className={styles.formLabel}>
                          Số CCCD (Căn cước)
                        </label>
                        <span className={styles.labelSubtext}>Đúng 12 số</span>
                      </div>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="VD: 079123456789"
                        value={newTeacherData.cccd}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, cccd: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                        className={`droplet-pill ${styles.formInput}`}
                      />
                    </div>

                    <div>
                      <label className={styles.formLabel}>
                        Địa Chỉ Cư Trú
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Quận 1, TP.HCM"
                        value={newTeacherData.diaChi}
                        onChange={(e) => setNewTeacherData({ ...newTeacherData, diaChi: e.target.value })}
                        className={`droplet-pill ${styles.formInput}`}
                      />
                    </div>
                  </div>

                  {/* CẤP TÀI KHOẢN ĐĂNG NHẬP CHO GIÁO VIÊN */}
                  <div className={styles.accountBox}>
                    <div className={styles.accountHeader}>
                      <label className={styles.accountCheckboxLabel}>
                        <input
                          type="checkbox"
                          checked={newTeacherData.createAccount}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNewTeacherData(prev => ({
                              ...prev,
                              createAccount: checked
                            }));
                          }}
                          className={styles.checkboxInput}
                        />
                        <div className={styles.accountTitleGroup}>
                          <ShieldCheck size={18} className={styles.shieldIcon} />
                          <span className={styles.accountTitle}>
                            Cấp Tài Khoản Đăng Nhập Cho Giáo Viên
                          </span>
                        </div>
                      </label>

                      <span className={`badge badge-info ${styles.accountBadge}`}>
                        Quyền: GIÁO VIÊN
                      </span>
                    </div>

                    {newTeacherData.createAccount && (
                      <div className={styles.accountFields}>
                        <div className={styles.formGrid2}>
                          {/* Tên đăng nhập (Lấy theo SĐT) */}
                          <div>
                            <div className={styles.formLabelBetween}>
                              <label className={styles.formLabel}>
                                Tài Khoản Đăng Nhập
                              </label>
                              <span className={styles.loginAccountHint}>Theo Số Điện Thoại</span>
                            </div>
                            <div className={styles.readOnlyInputWrapper}>
                              <Phone size={15} className={styles.readOnlyIcon} />
                              <input
                                type="text"
                                readOnly
                                value={newTeacherData.sdt ? newTeacherData.sdt : 'Chưa nhập số điện thoại'}
                                className={`droplet-pill ${styles.readOnlyInput} ${!newTeacherData.sdt ? styles.readOnlyInputEmpty : ''}`}
                              />
                            </div>
                          </div>

                          {/* Mật khẩu (Tự nhập) */}
                          <div>
                            <div className={styles.formLabelBetween}>
                              <label className={styles.formLabel}>
                                Mật Khẩu Tự Nhập *
                              </label>
                              <span className={styles.labelSubtext}>≥ 6 ký tự</span>
                            </div>
                            <div className={styles.passwordInputWrapper}>
                              <Lock size={15} className={styles.lockIcon} />
                              <input
                                type={newTeacherData.showPassword ? 'text' : 'password'}
                                placeholder="Tự nhập mật khẩu cho GV..."
                                value={newTeacherData.matKhau}
                                onChange={(e) => setNewTeacherData({ ...newTeacherData, matKhau: e.target.value })}
                                className={`droplet-pill ${styles.passwordInput}`}
                              />
                              <button
                                type="button"
                                onClick={() => setNewTeacherData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                                className={styles.btnToggleEye}
                              >
                                {newTeacherData.showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <p className={styles.accountTip}>
                          💡 Giáo viên sẽ dùng chính <strong>Số điện thoại</strong> và <strong>Mật khẩu vừa nhập</strong> để đăng nhập vào cổng thông tin giáo viên.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Cố Định Cho Nút Bấm Form */}
                <div className={styles.formActionsFooter}>
                  <button
                    type="button"
                    onClick={() => setShowAddTeacherModal(false)}
                    className={`droplet-pill ${styles.btnCancel}`}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTeacher}
                    className={`droplet-pill droplet-pill-mint ${styles.btnSubmit}`}
                  >
                    {submittingTeacher && <RefreshCw size={15} className="animate-spin" />}
                    <span>{submittingTeacher ? 'Đang lưu...' : 'Lưu Giáo Viên Mới'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Nhập Giáo Viên Hàng Loạt (Excel / Thủ công) */}
      <ModalNhapGiaoVienHangLoat
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => fetchTeachersByBranch(selectedBranch)}
        chiNhanhs={chiNhanhs}
        selectedBranch={selectedBranch}
      />
    </div>
  );
};

export default TrangGiaoVien;


