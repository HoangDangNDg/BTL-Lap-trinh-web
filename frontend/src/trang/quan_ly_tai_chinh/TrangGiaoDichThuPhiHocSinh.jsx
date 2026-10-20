import React, { useReducer, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DollarSign,
  ArrowLeft,
  Receipt,
  Plus,
  Printer,
  Trash2,
  Calendar,
  CreditCard,
  Wallet,
  Phone,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  FileText,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building2,
  BookOpen
} from 'lucide-react';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { dichVuTaiChinh } from '../../dich_vu/tao_tu_dong/dichVuTaiChinh';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import ChiTietHocSinhView from '../../thanh_phan/quan_ly_lop_hoc/ChiTietHocSinhView';
import { thongBao } from '../../tien_ich/thongBao';

// ── 1. ACTION TYPES CHO GIAODICH_REDUCER ──
const GD_ACTIONS = {
  INIT_FROM_LOCATION: 'INIT_FROM_LOCATION',
  SET_LOADING: 'SET_LOADING',
  FETCH_DATA_SUCCESS: 'FETCH_DATA_SUCCESS',
  FETCH_DATA_ERROR: 'FETCH_DATA_ERROR',
  MO_MODAL_THU: 'MO_MODAL_THU',
  DONG_MODAL_THU: 'DONG_MODAL_THU',
  SET_FORM_DATA: 'SET_FORM_DATA',
  SUBMIT_THU_START: 'SUBMIT_THU_START',
  SUBMIT_THU_SUCCESS: 'SUBMIT_THU_SUCCESS',
  SUBMIT_THU_ERROR: 'SUBMIT_THU_ERROR',
  XOA_PHIEU_START: 'XOA_PHIEU_START',
  XOA_PHIEU_SUCCESS: 'XOA_PHIEU_SUCCESS',
  SET_PRINTING_PHIEU: 'SET_PRINTING_PHIEU',
  TOGGLE_HO_SO_HS: 'TOGGLE_HO_SO_HS',
  ROLLBACK_ACTION: 'ROLLBACK_ACTION'
};

// ── 2. INITIAL STATE ──
const initialGiaoDichState = {
  loading: true,
  error: null,

  // Thông tin ngữ cảnh
  hocSinh: null,
  khoaHoc: null,
  lopHoc: null,
  chiNhanh: null,
  kyHocId: null,
  boMonId: null,

  // Dữ liệu từ bảng thanh_toan_hoc_phi_khoa_hoc_hoc_sinh
  thanhToanInfo: {
    idThanhToan: null,
    tongTienPhaiNap: 0,
    soTienDaNap: 0,
    conThieu: 0,
    trangThai: false,
    ghiChu: ''
  },

  // Danh sách từ bảng phieu_thu_hoc_phi
  danhSachPhieuThu: [],

  // Modal & Form lập phiếu thu mới
  showModalThu: false,
  submittingThu: false,
  formDataThu: {
    soTienThu: '',
    ngayThu: new Date().toISOString().split('T')[0],
    phuongThuc: 'CHUYEN_KHOAN',
    ghiChu: ''
  },

  // In biên lai phiếu thu
  printingPhieu: null,

  // Xem hồ sơ học sinh
  showHoSoHocSinh: false,

  // Stack lưu trữ lịch sử thao tác để có thể rollback khi cần
  actionHistory: []
};

// ── 3. REDUCER QUẢN LÝ TIẾN TRÌNH GIAO DỊCH & ROLLBACK ──
function giaoDichReducer(state, action) {
  switch (action.type) {
    case GD_ACTIONS.INIT_FROM_LOCATION:
      return {
        ...state,
        hocSinh: action.payload.hocSinh || state.hocSinh,
        khoaHoc: action.payload.khoaHoc || state.khoaHoc,
        lopHoc: action.payload.lopHoc || state.lopHoc,
        chiNhanh: action.payload.chiNhanh || state.chiNhanh,
        kyHocId: action.payload.kyHocId ?? state.kyHocId,
        boMonId: action.payload.boMonId ?? state.boMonId,
        thanhToanInfo: action.payload.thanhToanItem ? {
          idThanhToan: action.payload.thanhToanItem.idThanhToan,
          tongTienPhaiNap: Number(action.payload.thanhToanItem.tongTienPhaiNap || 0),
          soTienDaNap: Number(action.payload.thanhToanItem.soTienDaNap || 0),
          conThieu: Number(action.payload.thanhToanItem.conThieu || 0),
          trangThai: Boolean(action.payload.thanhToanItem.trangThai),
          ghiChu: action.payload.thanhToanItem.ghiChu || ''
        } : state.thanhToanInfo
      };

    case GD_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };

    case GD_ACTIONS.FETCH_DATA_SUCCESS: {
      const { phieuThuList, thanhToanItem, courseFee } = action.payload;
      const phaiNap = Number(thanhToanItem?.tongTienPhaiNap || courseFee || 0);
      const tongTuPhieu = (phieuThuList || []).reduce((sum, p) => sum + (Number(p.soTienThu) || 0), 0);
      const daNap = Math.max(Number(thanhToanItem?.soTienDaNap || 0), tongTuPhieu);
      const conThieu = Math.max(0, phaiNap - daNap);
      const isDone = Boolean(thanhToanItem?.trangThai) || (phaiNap > 0 && daNap >= phaiNap);

      return {
        ...state,
        loading: false,
        error: null,
        danhSachPhieuThu: phieuThuList || [],
        thanhToanInfo: {
          idThanhToan: thanhToanItem?.idThanhToan || null,
          tongTienPhaiNap: phaiNap,
          soTienDaNap: daNap,
          conThieu,
          trangThai: isDone,
          ghiChu: thanhToanItem?.ghiChu || ''
        }
      };
    }

    case GD_ACTIONS.FETCH_DATA_ERROR:
      return { ...state, loading: false, error: action.payload };

    case GD_ACTIONS.MO_MODAL_THU: {
      const suggestAmount = state.thanhToanInfo.conThieu > 0 ? String(state.thanhToanInfo.conThieu) : '';
      return {
        ...state,
        showModalThu: true,
        formDataThu: {
          soTienThu: suggestAmount,
          ngayThu: new Date().toISOString().split('T')[0],
          phuongThuc: 'CHUYEN_KHOAN',
          ghiChu: `Thu học phí khóa ${state.khoaHoc?.tenKhoaHoc || ''}`
        }
      };
    }

    case GD_ACTIONS.DONG_MODAL_THU:
      return { ...state, showModalThu: false, submittingThu: false };

    case GD_ACTIONS.SET_FORM_DATA:
      return {
        ...state,
        formDataThu: { ...state.formDataThu, ...action.payload }
      };

    case GD_ACTIONS.SUBMIT_THU_START:
      return { ...state, submittingThu: true, error: null };

    case GD_ACTIONS.SUBMIT_THU_SUCCESS: {
      const newPhieu = action.payload;
      const updatedList = [newPhieu, ...state.danhSachPhieuThu];
      const phaiNap = state.thanhToanInfo.tongTienPhaiNap;
      const tongTuPhieu = updatedList.reduce((sum, p) => sum + (Number(p.soTienThu) || 0), 0);
      const daNap = Math.max(state.thanhToanInfo.soTienDaNap + Number(newPhieu.soTienThu || 0), tongTuPhieu);
      const conThieu = Math.max(0, phaiNap - daNap);
      const isDone = phaiNap > 0 && daNap >= phaiNap;

      // Lưu lại snapshot trước khi thay đổi vào actionHistory để có thể rollback
      const prevSnapshot = {
        danhSachPhieuThu: state.danhSachPhieuThu,
        thanhToanInfo: state.thanhToanInfo
      };

      return {
        ...state,
        showModalThu: false,
        submittingThu: false,
        danhSachPhieuThu: updatedList,
        thanhToanInfo: {
          ...state.thanhToanInfo,
          soTienDaNap: daNap,
          conThieu,
          trangThai: isDone
        },
        actionHistory: [prevSnapshot, ...state.actionHistory]
      };
    }

    case GD_ACTIONS.SUBMIT_THU_ERROR:
      return { ...state, submittingThu: false, error: action.payload };

    case GD_ACTIONS.XOA_PHIEU_SUCCESS: {
      const idPhieuThu = action.payload;
      const prevSnapshot = {
        danhSachPhieuThu: state.danhSachPhieuThu,
        thanhToanInfo: state.thanhToanInfo
      };

      const updatedList = state.danhSachPhieuThu.filter(p => p.idPhieuThu !== idPhieuThu);
      const phaiNap = state.thanhToanInfo.tongTienPhaiNap;
      const tongTuPhieu = updatedList.reduce((sum, p) => sum + (Number(p.soTienThu) || 0), 0);
      const daNap = tongTuPhieu;
      const conThieu = Math.max(0, phaiNap - daNap);
      const isDone = phaiNap > 0 && daNap >= phaiNap;

      return {
        ...state,
        danhSachPhieuThu: updatedList,
        thanhToanInfo: {
          ...state.thanhToanInfo,
          soTienDaNap: daNap,
          conThieu,
          trangThai: isDone
        },
        actionHistory: [prevSnapshot, ...state.actionHistory]
      };
    }

    case GD_ACTIONS.SET_PRINTING_PHIEU:
      return { ...state, printingPhieu: action.payload };

    case GD_ACTIONS.TOGGLE_HO_SO_HS:
      return { ...state, showHoSoHocSinh: !state.showHoSoHocSinh };

    case GD_ACTIONS.ROLLBACK_ACTION: {
      if (state.actionHistory.length === 0) return state;
      const [lastSnapshot, ...restHistory] = state.actionHistory;
      return {
        ...state,
        danhSachPhieuThu: lastSnapshot.danhSachPhieuThu,
        thanhToanInfo: lastSnapshot.thanhToanInfo,
        actionHistory: restHistory
      };
    }

    default:
      return state;
  }
}

export default function TrangGiaoDichThuPhiHocSinh() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useTrangThaiXacThuc();
  const idDn = user?.idDoanhNghiep || 1;

  const [state, dispatch] = useReducer(giaoDichReducer, initialGiaoDichState);

  // ── 4. KHỞI TẠO DỮ LIỆU TỪ LOCATION STATE HOẶC URL PARAMS ──
  const idHsParam = searchParams.get('idHs');
  const idKhoaHocParam = searchParams.get('idKhoaHoc');

  const hocSinhState = location.state?.hocSinh;
  const khoaHocState = location.state?.khoaHoc;
  const lopHocState = location.state?.lopHoc;
  const chiNhanhState = location.state?.chiNhanh;
  const kyHocIdState = location.state?.kyHocId;
  const boMonIdState = location.state?.boMonId;
  const thanhToanItemState = location.state?.thanhToanItem;

  // ── 5. FETCH VÀ ĐỒNG BỘ DỮ LIỆU TỪ 2 BẢNG CSDL ──
  const loadGiaoDichData = useCallback(async () => {
    try {
      dispatch({ type: GD_ACTIONS.SET_LOADING, payload: true });

      let hs = hocSinhState;
      let kh = khoaHocState;
      const currentHsId = hs?.idHs || (idHsParam ? Number(idHsParam) : null);
      const currentCourseId = kh?.idKhoaHoc || (idKhoaHocParam ? Number(idKhoaHocParam) : null);

      if (!currentHsId || !currentCourseId) {
        dispatch({
          type: GD_ACTIONS.FETCH_DATA_ERROR,
          payload: 'Thiếu thông tin học sinh hoặc khóa học để xem giao dịch thu phí.'
        });
        return;
      }

      // Nếu chưa có object học sinh / khóa học từ state, fetch bổ sung
      if (!hs) {
        hs = await dichVuHocSinhPhuHuynh.getHocSinh(currentHsId).catch(() => ({ idHs: currentHsId, hoTen: `Học sinh #${currentHsId}` }));
      }
      if (!kh) {
        kh = await dichVuDaoTaoChung.getKhoaHocTheoId(currentCourseId).catch(() => ({ idKhoaHoc: currentCourseId, tenKhoaHoc: `Khóa học #${currentCourseId}`, giaTien: 0 }));
      }

      dispatch({
        type: GD_ACTIONS.INIT_FROM_LOCATION,
        payload: {
          hocSinh: hs,
          khoaHoc: kh,
          lopHoc: lopHocState,
          chiNhanh: chiNhanhState,
          kyHocId: kyHocIdState,
          boMonId: boMonIdState,
          thanhToanItem: thanhToanItemState
        }
      });

      // Tải đồng thời:
      // Bảng 1: thanh_toan_hoc_phi_khoa_hoc_hoc_sinh (kiểm tra trạng thái hoàn tất)
      // Bảng 2: phieu_thu_hoc_phi (danh sách các giao dịch thực tế)
      const [thanhToanRes, phieuThuRes] = await Promise.all([
        dichVuTaiChinh.getThanhToanHocPhiTheoKhoaHoc(currentCourseId).catch(() => []),
        dichVuTaiChinh.getPhieuThuTheoKhoaHoc(currentCourseId).catch(() => [])
      ]);

      const thanhToanList = Array.isArray(thanhToanRes) ? thanhToanRes : (thanhToanRes?.data || []);
      const phieuThuList = Array.isArray(phieuThuRes) ? phieuThuRes : (phieuThuRes?.data || []);

      // Lọc bản ghi của học sinh này
      const myThanhToan = thanhToanList.find(tt => {
        const hId = tt.hocSinh?.idHs || tt.hocSinhKhoaHoc?.hocSinh?.idHs || tt.idHs;
        return Number(hId) === Number(currentHsId);
      });

      const myPhieuThuList = phieuThuList.filter(pt => {
        const hId = pt.hocSinh?.idHs || pt.idHs;
        return Number(hId) === Number(currentHsId);
      });

      dispatch({
        type: GD_ACTIONS.FETCH_DATA_SUCCESS,
        payload: {
          phieuThuList: myPhieuThuList,
          thanhToanItem: myThanhToan || thanhToanItemState,
          courseFee: Number(kh?.giaTien || kh?.hocPhi || 0)
        }
      });
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu giao dịch thu phí:', err);
      dispatch({
        type: GD_ACTIONS.FETCH_DATA_ERROR,
        payload: 'Không thể tải sổ giao dịch thu phí của học sinh.'
      });
    }
  }, [idHsParam, idKhoaHocParam, hocSinhState, khoaHocState, lopHocState, chiNhanhState, kyHocIdState, boMonIdState, thanhToanItemState]);

  useEffect(() => {
    loadGiaoDichData();
  }, [loadGiaoDichData]);

  // ── 6. TIẾN TRÌNH ROLLBACK: QUAY LẠI BẢNG KIỂM SOÁT HỌC PHÍ ──
  const handleRollbackToCourse = () => {
    navigate('/phieu-thu', {
      state: {
        restoreCnId: state.chiNhanh?.idCn,
        restoreKyHocId: state.kyHocId,
        restoreLopId: state.lopHoc?.idLop,
        restoreKhoaHocId: state.khoaHoc?.idKhoaHoc,
        restoreBoMonId: state.boMonId
      }
    });
  };

  // ── 7. LẬP PHIẾU THU TIỀN MỚI ──
  const handleSubmitLapPhieu = async (e) => {
    e.preventDefault();
    const tienThu = Number(state.formDataThu.soTienThu);
    if (!tienThu || tienThu <= 0) {
      thongBao.warning('Vui lòng nhập số tiền thu hợp lệ (> 0 đ)!');
      return;
    }

    try {
      dispatch({ type: GD_ACTIONS.SUBMIT_THU_START });

      const payload = {
        hocSinh: { idHs: state.hocSinh.idHs },
        khoaHoc: { idKhoaHoc: state.khoaHoc.idKhoaHoc },
        soTienThu: tienThu,
        ngayThu: state.formDataThu.ngayThu,
        phuongThuc: state.formDataThu.phuongThuc,
        ghiChu: state.formDataThu.ghiChu,
        doanhNghiep: { idDn }
      };

      const res = await dichVuTaiChinh.lapPhieuThuHocPhi(payload);
      const savedPhieu = res?.data || res || {
        ...payload,
        idPhieuThu: Date.now()
      };

      dispatch({ type: GD_ACTIONS.SUBMIT_THU_SUCCESS, payload: savedPhieu });

      // Mở Modal Thông Báo Hoàn Tất Chuyên Biệt
      thongBao.hoanTat({
        tieuDe: 'Lập Phiếu Thu Hoàn Tất!',
        thongDiep: 'Giao dịch thu học phí đã được lưu vào hệ thống và cập nhật trực tiếp vào tiến độ đóng phí của học sinh.',
        thongTinChiTiet: [
          { nhan: 'Mã phiếu thu', giaTri: `#${savedPhieu.idPhieuThu || 'Mới'}` },
          { nhan: 'Học sinh', giaTri: state.hocSinh?.hoTen || 'Học sinh' },
          { nhan: 'Khóa học', giaTri: state.khoaHoc?.tenKhoaHoc || 'Khóa học' },
          { nhan: 'Số tiền thu', giaTri: `${tienThu.toLocaleString('vi-VN')} đ`, noiBat: true },
          { nhan: 'Phương thức', giaTri: state.formDataThu.phuongThuc || 'Chuyển khoản' },
          { nhan: 'Ngày thu', giaTri: state.formDataThu.ngayThu || new Date().toLocaleDateString('vi-VN') }
        ],
        onDong: () => {
          loadGiaoDichData();
        }
      });

      thongBao.success('Đã lập giao dịch phiếu thu thành công và cập nhật bảng thanh toán!');
      loadGiaoDichData();
    } catch (err) {
      console.error('Lỗi khi lập phiếu thu:', err);
      const serverMsg = err?.response?.data?.message || err?.message || 'Không thể lập phiếu thu. Vui lòng thử lại!';
      dispatch({ type: GD_ACTIONS.SUBMIT_THU_ERROR, payload: serverMsg });
      thongBao.error(serverMsg, { tieuDe: 'Không thể lập phiếu thu' });
    }
  };

  // ── 8. XÓA PHIẾU THU HỌC PHÍ ──
  const handleDeletePhieuThu = (idPhieuThu) => {
    thongBao.xacNhan({
      tieuDe: `Xóa Phiếu Thu #${idPhieuThu}`,
      thongDiep: `Bạn có chắc chắn muốn xóa Phiếu Thu #${idPhieuThu}? Thao tác này sẽ tự động trừ lại số tiền đã nộp trong bảng theo dõi tiến độ.`,
      loai: 'danger',
      nhanXacNhan: 'Xác nhận xóa',
      nhanHuy: 'Hủy bỏ',
      onXacNhan: async () => {
        try {
          await dichVuTaiChinh.deletePhieuThu(idPhieuThu);
          dispatch({ type: GD_ACTIONS.XOA_PHIEU_SUCCESS, payload: idPhieuThu });
          thongBao.success(`Đã xóa thành công Phiếu Thu #${idPhieuThu}!`);
          loadGiaoDichData();
        } catch (err) {
          console.error('Lỗi khi xóa phiếu thu:', err);
          thongBao.error('Không thể xóa phiếu thu. Vui lòng thử lại!');
        }
      }
    });
  };

  const isDone = state.thanhToanInfo.trangThai;
  const percent = state.thanhToanInfo.tongTienPhaiNap > 0
    ? Math.min(100, Math.round((state.thanhToanInfo.soTienDaNap / state.thanhToanInfo.tongTienPhaiNap) * 100))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', width: '100%', paddingBottom: '4rem' }}>
      
      {/* ── BREADCRUMB TIẾN TRÌNH & NÚT QUAY LẠI AN TOÀN ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1rem 1.5rem',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Nút Quay lại Bảng kiểm soát học phí */}
          <button
            onClick={handleRollbackToCourse}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#0F172A',
              fontSize: '0.85rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.borderColor = '#93C5FD'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            title="Quay lại danh sách kiểm soát học phí khóa học"
          >
            <ArrowLeft size={16} />
            Quay lại bảng kiểm soát học phí
          </button>

          <span style={{ color: '#CBD5E1' }}>|</span>

          {/* Breadcrumb theo tiến trình */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: '#64748B' }}>
            <span 
              onClick={() => navigate('/phieu-thu')}
              style={{ cursor: 'pointer', color: '#2563EB', fontWeight: '700' }}
            >
              Thu Học Phí Học Sinh
            </span>
            <ChevronRight size={14} style={{ color: '#94A3B8' }} />
            {state.chiNhanh && (
              <>
                <span style={{ color: '#475569', fontWeight: '600' }}>{state.chiNhanh.tenCn}</span>
                <ChevronRight size={14} style={{ color: '#94A3B8' }} />
              </>
            )}
            {state.lopHoc && (
              <>
                <span 
                  onClick={handleRollbackToCourse}
                  style={{ cursor: 'pointer', color: '#0369A1', fontWeight: '700' }}
                >
                  Lớp: {state.lopHoc.tenLop}
                </span>
                <ChevronRight size={14} style={{ color: '#94A3B8' }} />
              </>
            )}
            <span 
              onClick={handleRollbackToCourse}
              style={{ cursor: 'pointer', color: '#2563EB', fontWeight: '700' }}
            >
              Khóa: {state.khoaHoc?.tenKhoaHoc || 'Khóa học'}
            </span>
            <ChevronRight size={14} style={{ color: '#94A3B8' }} />
            <span style={{ color: '#0F172A', fontWeight: '800' }}>
              Sổ Giao Dịch: {state.hocSinh?.hoTen || 'Học sinh'}
            </span>
          </div>
        </div>

        {/* Nút Làm Mới */}
        <button
          onClick={loadGiaoDichData}
          disabled={state.loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={state.loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* ── THÔNG BÁO LỖI NẾU CÓ ── */}
      {state.error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '14px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#B91C1C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{state.error}</span>
          </div>
          <button
            onClick={handleRollbackToCourse}
            style={{
              padding: '0.35rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: '#B91C1C',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Quay lại
          </button>
        </div>
      )}

      {/* ── HERO BANNER: THÔNG TIN HỌC SINH & TRẠNG THÁI CÔNG NỢ HỌC PHÍ (TỪ BẢNG THANH TOÁN) ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.75rem',
          borderRadius: '24px',
          backgroundColor: isDone ? '#F0FDF4' : '#FFFFFF',
          border: isDone ? '1.5px solid #BBF7D0' : '1.5px solid #FECACA',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Header Hero */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              backgroundColor: state.hocSinh?.gioiTinh === 'F' ? '#FDF2F8' : '#EFF6FF',
              color: state.hocSinh?.gioiTinh === 'F' ? '#DB2777' : '#2563EB',
              fontSize: '1.25rem',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)'
            }}>
              {state.hocSinh?.hoTen
                ? state.hocSinh.hoTen.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
                : 'HS'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  {state.hocSinh?.hoTen || 'Đang tải học sinh...'}
                </h1>
                <span style={{
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  backgroundColor: '#E2E8F0',
                  color: '#334155'
                }}>
                  Học viên
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.85rem', color: '#64748B', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Phone size={14} /> {state.hocSinh?.soDienThoai || 'Chưa cập nhật SĐT'}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <BookOpen size={14} /> Khóa học: <strong style={{ color: '#1E293B' }}>{state.khoaHoc?.tenKhoaHoc}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Nút hành động chính */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => dispatch({ type: GD_ACTIONS.TOGGLE_HO_SO_HS })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <GraduationCap size={16} />
              {state.showHoSoHocSinh ? 'Ẩn Hồ Sơ Học Sinh' : 'Xem Hồ Sơ Chi Tiết'}
            </button>

            <button
              onClick={() => dispatch({ type: GD_ACTIONS.MO_MODAL_THU })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.35rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Plus size={18} />
              Lập Giao Dịch Thu Tiền Mới
            </button>
          </div>
        </div>

        {/* Lưới 4 Thẻ Số Liệu Tài Chính (Từ Bảng Thanh Toán Học Phí Khóa Học Học Sinh) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.15rem',
          padding: '1.25rem',
          borderRadius: '18px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
              Học Phí Khóa Học
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', marginTop: '0.25rem' }}>
              {state.thanhToanInfo.tongTienPhaiNap.toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#15803D', textTransform: 'uppercase' }}>
              Tổng Tiền Đã Nộp
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#15803D', marginTop: '0.25rem' }}>
              {state.thanhToanInfo.soTienDaNap.toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#B91C1C', textTransform: 'uppercase' }}>
              Số Tiền Còn Thiếu
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: state.thanhToanInfo.conThieu > 0 ? '#DC2626' : '#15803D', marginTop: '0.25rem' }}>
              {state.thanhToanInfo.conThieu.toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
              Trạng Thái Thanh Toán
            </div>
            <div style={{ marginTop: '0.35rem' }}>
              <span style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: '900',
                backgroundColor: isDone ? '#DCFCE7' : '#FEE2E2',
                color: isDone ? '#15803D' : '#B91C1C',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                {isDone ? '✓ ĐÃ HOÀN TẤT THANH TOÁN' : '⚠ CHƯA HOÀN TẤT (CÒN THIẾU)'}
              </span>
            </div>
          </div>
        </div>

        {/* Thanh Tiến Độ Đóng Học Phí */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', marginBottom: '0.4rem', fontWeight: '700' }}>
            <span>Tiến độ thanh toán:</span>
            <span style={{ color: isDone ? '#15803D' : '#D97706', fontWeight: '800' }}>{percent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
            <div style={{
              width: `${percent}%`,
              height: '100%',
              backgroundColor: isDone ? '#16A34A' : '#F59E0B',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* ── XEM HỒ SƠ HỌC SINH 360 NẾU ĐƯỢC BẬT ── */}
      {state.showHoSoHocSinh && state.hocSinh && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
              Hồ Sơ Học Sinh Chi Tiết
            </h3>
            <button
              onClick={() => navigate('/hoc-sinh', { state: { selectedHocSinhId: state.hocSinh.idHs, hocSinh: state.hocSinh } })}
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
              Mở Trang Quản Lý Học Sinh
            </button>
          </div>

          <ChiTietHocSinhView
            hocSinh={state.hocSinh}
            onBack={() => dispatch({ type: GD_ACTIONS.TOGGLE_HO_SO_HS })}
          />
        </div>
      )}

      {/* ── LƯỚI DANH SÁCH CÁC PHIẾU THU THỰC TẾ (BẢNG PHIEU_THU_HOC_PHI) ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.6rem',
          borderRadius: '24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
                Lịch Sử Giao Dịch Thu Học Phí (Bảng Phiếu Thu)
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                Toàn bộ các phiếu thu tiền học phí đã lập cho học sinh này trong khóa học
              </p>
            </div>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '800',
              padding: '0.2rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB'
            }}>
              {state.danhSachPhieuThu.length} phiếu
            </span>
          </div>

          <button
            onClick={() => dispatch({ type: GD_ACTIONS.MO_MODAL_THU })}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Lập Phiếu Mới
          </button>
        </div>

        {state.loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
            Đang tải dữ liệu phiếu thu...
          </div>
        ) : state.danhSachPhieuThu.length === 0 ? (
          <div style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: '20px',
            border: '1px dashed #CBD5E1'
          }}>
            <Receipt size={40} style={{ color: '#94A3B8', marginBottom: '0.6rem' }} />
            <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', fontWeight: '700', color: '#1E293B' }}>
              Chưa có giao dịch phiếu thu nào
            </h4>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748B' }}>
              Học sinh này chưa có biên lai hoặc phiếu thu tiền học phí nào được ghi nhận cho khóa học này.
            </p>
            <button
              onClick={() => dispatch({ type: GD_ACTIONS.MO_MODAL_THU })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.35rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              Lập Phiếu Thu Ngay
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.15rem' }}>
            {state.danhSachPhieuThu.map((pt, idx) => {
              const amount = Number(pt.soTienThu || 0);
              const dateStr = pt.ngayThu 
                ? (typeof pt.ngayThu === 'string' ? pt.ngayThu : new Date(pt.ngayThu).toLocaleDateString('vi-VN'))
                : 'Hôm nay';
              const isChuyenKhoan = pt.phuongThuc === 'CHUYEN_KHOAN';

              return (
                <div
                  key={pt.idPhieuThu || idx}
                  className="droplet-card"
                  style={{
                    padding: '1.25rem',
                    borderRadius: '18px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563EB' }}>
                        PHIẾU THU (Đợt {idx + 1})
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#15803D', marginTop: '0.2rem' }}>
                        {amount.toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    <span style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      backgroundColor: isChuyenKhoan ? '#EFF6FF' : '#FEF3C7',
                      color: isChuyenKhoan ? '#2563EB' : '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {isChuyenKhoan ? <CreditCard size={12} /> : <Wallet size={12} />}
                      {isChuyenKhoan ? 'Chuyển khoản' : 'Tiền mặt'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} /> Ngày thu: <strong style={{ color: '#1E293B' }}>{dateStr}</strong>
                    </div>
                    {pt.ghiChu && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                        <FileText size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Ghi chú: {pt.ghiChu}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      onClick={() => dispatch({ type: GD_ACTIONS.SET_PRINTING_PHIEU, payload: pt })}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        color: '#334155',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Printer size={13} />
                      In Biên Lai
                    </button>

                    <button
                      onClick={() => handleDeletePhieuThu(pt.idPhieuThu)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} />
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL LẬP PHIẾU THU MỚI ── */}
      {state.showModalThu && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div 
            className="droplet-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                    Lập Phiếu Thu Học Phí Mới
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Học sinh: <strong>{state.hocSinh?.hoTen}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: GD_ACTIONS.DONG_MODAL_THU })}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitLapPhieu} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Số tiền thu (VNĐ) <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={state.formDataThu.soTienThu}
                  onChange={e => dispatch({ type: GD_ACTIONS.SET_FORM_DATA, payload: { soTienThu: e.target.value } })}
                  placeholder="Nhập số tiền thu..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    color: '#15803D',
                    outline: 'none'
                  }}
                />
                {state.thanhToanInfo.conThieu > 0 && (
                  <div style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: '0.35rem' }}>
                    Gợi ý: Còn thiếu <strong>{state.thanhToanInfo.conThieu.toLocaleString('vi-VN')} đ</strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Ngày thu tiền
                </label>
                <input
                  type="date"
                  required
                  value={state.formDataThu.ngayThu}
                  onChange={e => dispatch({ type: GD_ACTIONS.SET_FORM_DATA, payload: { ngayThu: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Phương thức thanh toán
                </label>
                <select
                  value={state.formDataThu.phuongThuc}
                  onChange={e => dispatch({ type: GD_ACTIONS.SET_FORM_DATA, payload: { phuongThuc: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="CHUYEN_KHOAN">Chuyển khoản ngân hàng</option>
                  <option value="TIEN_MAT">Tiền mặt tại quầy</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={state.formDataThu.ghiChu}
                  onChange={e => dispatch({ type: GD_ACTIONS.SET_FORM_DATA, payload: { ghiChu: e.target.value } })}
                  placeholder="Ghi chú thêm về lần thu tiền này..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => dispatch({ type: GD_ACTIONS.DONG_MODAL_THU })}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={state.submittingThu}
                  style={{
                    flex: 2,
                    padding: '0.65rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {state.submittingThu ? 'Đang ghi nhận...' : 'Xác Nhận Thu Tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL IN BIÊN LAI THU TIỀN CHUYÊN NGHIỆP ── */}
      {state.printingPhieu && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div 
            className="droplet-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2563EB' }}>BIÊN LAI ĐIỆN TỬ</span>
              <button
                onClick={() => dispatch({ type: GD_ACTIONS.SET_PRINTING_PHIEU, payload: null })}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Khung biên lai in */}
            <div style={{
              border: '2px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              backgroundColor: '#FAFAFA'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase' }}>
                  Biên Lai Thu Học Phí
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Ngày thu: <strong>{state.printingPhieu.ngayThu}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Học sinh:</span>
                  <strong style={{ color: '#0F172A' }}>{state.hocSinh?.hoTen}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Số điện thoại:</span>
                  <span>{state.hocSinh?.soDienThoai || 'Chưa cập nhật'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Khóa học:</span>
                  <strong style={{ color: '#0F172A' }}>{state.khoaHoc?.tenKhoaHoc}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Hình thức:</span>
                  <span>{state.printingPhieu.phuongThuc === 'CHUYEN_KHOAN' ? 'Chuyển khoản ngân hàng' : 'Tiền mặt'}</span>
                </div>
                {state.printingPhieu.ghiChu && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Nội dung:</span>
                    <span style={{ textAlign: 'right', maxWidth: '240px' }}>{state.printingPhieu.ghiChu}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed #CBD5E1',
                  paddingTop: '0.75rem',
                  marginTop: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '900'
                }}>
                  <span style={{ color: '#0F172A' }}>SỐ TIỀN THU:</span>
                  <span style={{ color: '#15803D' }}>{Number(state.printingPhieu.soTienThu || 0).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                <div>
                  <strong>Người nộp tiền</strong>
                  <div style={{ marginTop: '2.5rem', fontStyle: 'italic' }}>{state.hocSinh?.hoTen}</div>
                </div>
                <div>
                  <strong>Người lập phiếu</strong>
                  <div style={{ marginTop: '2.5rem', fontStyle: 'italic' }}>Bộ phận kế toán</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => dispatch({ type: GD_ACTIONS.SET_PRINTING_PHIEU, payload: null })}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                In Biên Lai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
