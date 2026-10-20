import React, { useReducer, useEffect, useMemo, useCallback, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, GraduationCap, User, Building } from 'lucide-react';
import { dichVuThoiKhoaBieu } from '../../dich_vu/dichVuThoiKhoaBieu';
import { dichVuGiaoVien } from '../../dich_vu/dichVuGiaoVien';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { useNamHocKyHocStore, tinhKhoangNgayTuanHoc, timTuanHocTheoThoiGianThuc } from '../../trang_thai/useNamHocKyHocStore';
import TrangBaoLoi from '../../thanh_phan/TrangBaoLoi';
import ModalThemLichDay from '../../thanh_phan/giao_vien/ModalThemLichDay';
import { thongBao } from '../../tien_ich/thongBao';

// Import các sub-component phân cấp tái sử dụng
import { checkSlotPast, getThuHienTai, isDayInPast } from '../../thanh_phan/thoi_khoa_bieu/caiDatTkb';
import KhungChonChiNhanhTkb from '../../thanh_phan/thoi_khoa_bieu/KhungChonChiNhanhTkb';
import ThanhDieuHuongTkb from '../../thanh_phan/thoi_khoa_bieu/ThanhDieuHuongTkb';
import ThanhPhanPhoiThu from '../../thanh_phan/thoi_khoa_bieu/ThanhPhanPhoiThu';
import ThanhBoLocTkb from '../../thanh_phan/thoi_khoa_bieu/ThanhBoLocTkb';
import BangTkbTheoPhongVaCa from '../../thanh_phan/thoi_khoa_bieu/BangTkbTheoPhongVaCa';
import BangTkbTheoTuan from '../../thanh_phan/thoi_khoa_bieu/BangTkbTheoTuan';
import ChiTietTkbModal from '../../thanh_phan/thoi_khoa_bieu/ChiTietTkbModal';

// ── KHỞI TẠO STATE & REDUCER THỜI KHÓA BIỂU CHUẨN HÓA ──
const initialTkbState = {
  // 1. Dữ liệu TKB
  tkbData: [],
  loading: false,
  error: null,
  viewMode: 'room', // Chế độ mặc định: Hàng ngang là Ca học, Hàng dọc là Phòng học theo Thứ (Ảnh 2)
  selectedCard: null,

  // 2. Chi nhánh & Phòng học
  chiNhanhList: [],
  loadingChiNhanh: false,
  selectedChiNhanhId: null,
  phongHocList: [],
  loadingPhongHoc: false,

  // 3. Thứ trong tuần (2 -> 8, luôn mặc định Thứ của ngày hôm nay theo thời gian thực)
  selectedThu: getThuHienTai(),

  // 4. Danh mục Bộ môn
  boMonList: [],

  // 5. Bộ lọc đa chiều
  filters: {
    searchKeyword: '',
    filterBoMon: '',
    filterGiaoVien: '',
    filterPhong: '',
    filterLop: '',
    filterCaNhan: false
  },

  // 6. Quản lý Modal thêm lịch học & Thao tác
  modalThem: {
    isOpen: false,
    preset: {
      idPhong: null,
      caHoc: 1,
      thu: getThuHienTai()
    }
  },
  deleting: false
};

function tkbReducer(state, action) {
  switch (action.type) {
    // Chi nhánh
    case 'FETCH_CHI_NHANH_START':
      return { ...state, loadingChiNhanh: true };
    case 'FETCH_CHI_NHANH_SUCCESS':
      return { ...state, loadingChiNhanh: false, chiNhanhList: action.payload };
    case 'SELECT_CHI_NHANH':
      return {
        ...state,
        selectedChiNhanhId: action.payload,
        phongHocList: [],
        selectedCard: null
      };

    // Phòng học
    case 'FETCH_PHONG_HOC_START':
      return { ...state, loadingPhongHoc: true };
    case 'FETCH_PHONG_HOC_SUCCESS':
      return { ...state, loadingPhongHoc: false, phongHocList: action.payload };

    // Bộ môn
    case 'FETCH_BO_MON_SUCCESS':
      return { ...state, boMonList: action.payload };

    // Dữ liệu Thời khóa biểu
    case 'FETCH_TKB_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_TKB_SUCCESS':
      return { ...state, loading: false, tkbData: action.payload, error: null };
    case 'FETCH_TKB_FAILURE':
      return { ...state, loading: false, error: action.payload };

    // Chế độ xem & Điều hướng
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SELECT_THU':
      return { ...state, selectedThu: action.payload };
    case 'SELECT_CARD':
      return { ...state, selectedCard: action.payload };

    // Bộ lọc
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };
    case 'TOGGLE_FILTER_CA_NHAN':
      return {
        ...state,
        filters: {
          ...state.filters,
          filterCaNhan: !state.filters.filterCaNhan
        }
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          searchKeyword: '',
          filterBoMon: '',
          filterGiaoVien: '',
          filterPhong: '',
          filterLop: '',
          filterCaNhan: false
        }
      };

    // Modal Thêm lịch dạy
    case 'OPEN_ADD_MODAL':
      return {
        ...state,
        modalThem: {
          isOpen: true,
          preset: action.payload || {
            idPhong: state.phongHocList[0]?.idPhong || null,
            caHoc: 1,
            thu: state.selectedThu
          }
        }
      };
    case 'CLOSE_ADD_MODAL':
      return {
        ...state,
        modalThem: {
          ...state.modalThem,
          isOpen: false
        }
      };

    // Trạng thái xóa
    case 'SET_DELETING':
      return { ...state, deleting: action.payload };

    default:
      return state;
  }
}

const TrangThoiKhoaBieu = () => {
  const { user } = useTrangThaiXacThuc();
  const isTeacher = user?.vaiTro === 'GIAO_VIEN';

  // Kết nối trực tiếp với store Năm học / Kỳ học / Tuần học toàn cục ở Header
  const {
    namHocList = [],
    selectedNamHocId,
    tuanHocList = [],
    selectedTuanHocId,
    fetchTuanHoc,
    selectedKyHocId,
    selectedThu: storeSelectedThu,
    setSelectedThu: setStoreSelectedThu
  } = useNamHocKyHocStore();

  // Khởi tạo useReducer tập trung quản lý toàn bộ State của trang
  const [state, dispatch] = useReducer(tkbReducer, initialTkbState);
  const {
    tkbData,
    loading,
    error,
    viewMode,
    selectedCard,
    chiNhanhList,
    loadingChiNhanh,
    selectedChiNhanhId,
    phongHocList,
    loadingPhongHoc,
    selectedThu,
    boMonList,
    filters,
    modalThem,
    deleting
  } = state;

  const {
    searchKeyword,
    filterBoMon,
    filterGiaoVien,
    filterPhong,
    filterLop,
    filterCaNhan
  } = filters;

  const fetchedTuanRef = useRef(false);
  // Tự động nạp danh sách tuần nếu store chưa có
  useEffect(() => {
    if ((!tuanHocList || tuanHocList.length === 0) && fetchTuanHoc && !fetchedTuanRef.current) {
      fetchedTuanRef.current = true;
      fetchTuanHoc(selectedKyHocId);
    }
  }, [tuanHocList, selectedKyHocId, fetchTuanHoc]);

  useEffect(() => {
    fetchedTuanRef.current = false;
  }, [selectedKyHocId]);

  // Đồng bộ Thứ khi chọn từ thanh điều hướng toàn cục (Header)
  useEffect(() => {
    if (storeSelectedThu && storeSelectedThu !== selectedThu) {
      dispatch({ type: 'SELECT_THU', payload: storeSelectedThu });
    }
  }, [storeSelectedThu]);

  // Nạp danh sách bộ môn
  useEffect(() => {
    const fetchBoMon = async () => {
      try {
        const bms = await dichVuDaoTaoChung.getDanhSachBoMon();
        dispatch({
          type: 'FETCH_BO_MON_SUCCESS',
          payload: Array.isArray(bms) ? bms : (bms?.data || [])
        });
      } catch (err) {
        console.error('Lỗi khi tải bộ môn:', err);
      }
    };
    fetchBoMon();
  }, []);

  // Bước 1: Tải danh sách chi nhánh khi vào trang
  useEffect(() => {
    const fetchChiNhanh = async () => {
      try {
        dispatch({ type: 'FETCH_CHI_NHANH_START' });
        const list = await dichVuDaoTaoChung.getDanhSachChiNhanh();
        const validList = Array.isArray(list) ? list : (list?.data || []);
        dispatch({ type: 'FETCH_CHI_NHANH_SUCCESS', payload: validList });
      } catch (err) {
        console.error('Lỗi khi tải danh sách chi nhánh:', err);
      }
    };
    fetchChiNhanh();
  }, []);

  // Bước 2: Tải danh sách phòng học khi chọn chi nhánh
  useEffect(() => {
    const fetchPhongHoc = async () => {
      if (!selectedChiNhanhId) return;
      try {
        dispatch({ type: 'FETCH_PHONG_HOC_START' });
        const phongs = await dichVuDaoTaoChung.getDanhSachPhongHoc(selectedChiNhanhId);
        const validPhongs = Array.isArray(phongs) ? phongs : (phongs?.data || []);
        dispatch({ type: 'FETCH_PHONG_HOC_SUCCESS', payload: validPhongs });
      } catch (err) {
        console.error('Lỗi khi tải phòng học của chi nhánh:', err);
      }
    };
    fetchPhongHoc();
  }, [selectedChiNhanhId]);

  // Nạp dữ liệu Thời khóa biểu theo Tuần và Chi Nhánh được chọn
  const fetchTkbTheoTuan = useCallback(async () => {
    if (!selectedTuanHocId || !selectedChiNhanhId) return;
    try {
      dispatch({ type: 'FETCH_TKB_START' });
      const items = await dichVuDaoTaoChung.getThoiKhoaBieuTheoTuan(selectedTuanHocId, selectedChiNhanhId);
      dispatch({ type: 'FETCH_TKB_SUCCESS', payload: items || [] });
    } catch (err) {
      console.error('Lỗi khi tải thời khóa biểu tuần:', err);
      dispatch({ type: 'FETCH_TKB_FAILURE', payload: err });
    }
  }, [selectedTuanHocId, selectedChiNhanhId]);

  useEffect(() => {
    fetchTkbTheoTuan();
  }, [fetchTkbTheoTuan]);

  // Luôn tự động chọn Thứ hiện tại của ngày hôm nay khi chọn hoặc đổi Tuần học
  useEffect(() => {
    if (selectedTuanHocId) {
      dispatch({ type: 'SELECT_THU', payload: getThuHienTai() });
    }
  }, [selectedTuanHocId]);

  const currentChiNhanh = useMemo(() => {
    return chiNhanhList.find(c => c.idCn === selectedChiNhanhId) || null;
  }, [chiNhanhList, selectedChiNhanhId]);

  const currentWeek = useMemo(() => {
    return (tuanHocList || []).find(t => t.idTh === selectedTuanHocId) || null;
  }, [tuanHocList, selectedTuanHocId]);

  const currentNamHoc = useMemo(() => {
    return (namHocList || []).find(nh => nh.idNh === selectedNamHocId) || null;
  }, [namHocList, selectedNamHocId]);

  // Kiểm tra Năm học đã hoàn thành hay chưa
  const isYearFinished = useMemo(() => {
    if (!currentNamHoc) return false;
    if (currentNamHoc.daHoanThanh) return true;
    if (currentNamHoc.ngayKetThuc) {
      const todayStr = new Date().toISOString().split('T')[0];
      return todayStr > currentNamHoc.ngayKetThuc;
    }
    return false;
  }, [currentNamHoc]);

  // Tính khoảng ngày của tuần học đang chọn (Luôn căn chỉnh Thứ 2 -> Chủ Nhật)
  const weekDateRange = useMemo(() => {
    if (!currentWeek) return null;
    return tinhKhoangNgayTuanHoc(currentWeek, currentNamHoc?.ngayBatDau, currentNamHoc?.namBatDau);
  }, [currentWeek, currentNamHoc]);

  // Kiểm tra Tuần học đang xem có phải tuần hiện tại theo thời gian thực không
  const isCurrentWeek = useMemo(() => {
    if (!currentWeek) return false;
    const now = new Date();
    if (weekDateRange?.start && weekDateRange?.end) {
      return now >= weekDateRange.start && now <= weekDateRange.end;
    }
    const realTimeWeek = timTuanHocTheoThoiGianThuc(tuanHocList, currentNamHoc?.ngayBatDau, currentNamHoc?.namBatDau);
    return realTimeWeek ? realTimeWeek.idTh === currentWeek.idTh : false;
  }, [currentWeek, weekDateRange, tuanHocList, currentNamHoc]);

  // Kiểm tra Tuần học đã kết thúc trước hôm nay hay chưa
  const isWeekPast = useMemo(() => {
    if (isYearFinished) return true;
    if (currentWeek?.ngayKetThuc) {
      const todayStr = new Date().toISOString().split('T')[0];
      const weekEndStr = currentWeek.ngayKetThuc.split('T')[0];
      return todayStr > weekEndStr;
    }
    const now = new Date();
    if (weekDateRange?.end) {
      return now > weekDateRange.end;
    }
    const realTimeWeek = timTuanHocTheoThoiGianThuc(tuanHocList, currentNamHoc?.ngayBatDau, currentNamHoc?.namBatDau);
    if (realTimeWeek?.soTuan && currentWeek?.soTuan) {
      return currentWeek.soTuan < realTimeWeek.soTuan;
    }
    return false;
  }, [isYearFinished, currentWeek, weekDateRange, tuanHocList, currentNamHoc]);

  const isReadOnly = isYearFinished || isWeekPast;

  const handleCheckSlotPast = useCallback((thu, caHoc, gioKetThucStr) => {
    return checkSlotPast(thu, caHoc, gioKetThucStr, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek);
  }, [isYearFinished, isWeekPast, weekDateRange, isCurrentWeek]);

  // Lọc dữ liệu TKB
  const filteredTkb = useMemo(() => {
    return (tkbData || []).filter(item => {
      if (selectedChiNhanhId && item.idChiNhanh && item.idChiNhanh !== selectedChiNhanhId) {
        return false;
      }
      if (filterCaNhan) {
        const myGvId = user?.roleId || user?.idGiaoVien;
        const myName = user?.hoTen?.toLowerCase() || '';
        const matchId = item.idGiaoVien && myGvId && item.idGiaoVien === myGvId;
        const matchName = item.tenGiaoVien && myName && item.tenGiaoVien.toLowerCase().includes(myName);
        if (!matchId && !matchName) return false;
      }

      const matchKeyword = !searchKeyword || 
        (item.tenLop && item.tenLop.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.tenKhoaHoc && item.tenKhoaHoc.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.tenGiaoVien && item.tenGiaoVien.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.tenPhong && item.tenPhong.toLowerCase().includes(searchKeyword.toLowerCase()));
      
      const matchBoMon = !filterBoMon || 
        (item.tenKhoaHoc && item.tenKhoaHoc.toLowerCase().includes(filterBoMon.toLowerCase())) ||
        (item.tenBoMon && item.tenBoMon.toLowerCase().includes(filterBoMon.toLowerCase()));
      const matchGv = !filterGiaoVien || (item.tenGiaoVien && item.tenGiaoVien === filterGiaoVien);
      const matchPhong = !filterPhong || (item.tenPhong && item.tenPhong === filterPhong);
      const matchLop = !filterLop || (item.tenLop && item.tenLop === filterLop);

      return matchKeyword && matchBoMon && matchGv && matchPhong && matchLop;
    });
  }, [tkbData, selectedChiNhanhId, filterCaNhan, user, searchKeyword, filterBoMon, filterGiaoVien, filterPhong, filterLop]);

  // Đếm số lượng tiết học theo từng Thứ trong tuần
  const sessionsCountByThu = useMemo(() => {
    const counts = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    filteredTkb.forEach(item => {
      if (item.thu && counts[item.thu] !== undefined) {
        counts[item.thu] += 1;
      }
    });
    return counts;
  }, [filteredTkb]);

  // Ma trận Phòng học x Ca học tại Thứ được chọn
  const roomCaMatrixMap = useMemo(() => {
    const map = new Map();
    filteredTkb.forEach(item => {
      if (item.thu === selectedThu && item.idPhong && item.caHoc) {
        const key = `${item.idPhong}_${item.caHoc}`;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(item);
      }
    });
    return map;
  }, [filteredTkb, selectedThu]);

  // Ma trận Thứ x Ca cho chế độ xem theo Tuần
  const matrixMap = useMemo(() => {
    const map = new Map();
    filteredTkb.forEach(item => {
      const key = `${item.thu}_${item.caHoc}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });
    return map;
  }, [filteredTkb]);

  // Thống kê metrics
  const metrics = useMemo(() => {
    const totalSlots = filteredTkb.length;
    const uniqueClasses = new Set(filteredTkb.map(i => i.idLop || i.tenLop).filter(Boolean)).size;
    const uniqueTeachers = new Set(filteredTkb.map(i => i.idGiaoVien || i.tenGiaoVien).filter(Boolean)).size;
    const uniqueRooms = phongHocList.length > 0 ? phongHocList.length : new Set(filteredTkb.map(i => i.idPhong || i.tenPhong).filter(Boolean)).size;
    return { totalSlots, uniqueClasses, uniqueTeachers, uniqueRooms };
  }, [filteredTkb, phongHocList]);

  // Options cho bộ lọc (Tập trung & Memoized để truyền xuống ThanhBoLocTkb)
  const filterOptions = useMemo(() => ({
    boMonList,
    teacherOptions: Array.from(new Set(filteredTkb.map(i => i.tenGiaoVien).filter(Boolean))).sort(),
    roomOptions: Array.from(new Set(filteredTkb.map(i => i.tenPhong).filter(Boolean))).sort(),
    classOptions: Array.from(new Set(filteredTkb.map(i => i.tenLop).filter(Boolean))).sort()
  }), [boMonList, filteredTkb]);

  // Mở modal thêm lịch dạy
  const handleOpenAddModal = useCallback((preset = null) => {
    if (isReadOnly) {
      thongBao.warning('Không thể thêm lịch dạy: Năm học đã hoàn thành hoặc tuần học này đã trôi qua!');
      return;
    }
    const thuHienTai = getThuHienTai();
    let targetThu = preset?.thu || selectedThu;
    if (isCurrentWeek && targetThu < thuHienTai) {
      targetThu = thuHienTai;
    }
    const targetPreset = preset ? {
      idPhong: preset.idPhong || null,
      caHoc: preset.caHoc || 1,
      thu: targetThu
    } : {
      idPhong: phongHocList.length > 0 ? phongHocList[0].idPhong : null,
      caHoc: 1,
      thu: targetThu
    };
    dispatch({ type: 'OPEN_ADD_MODAL', payload: targetPreset });
  }, [isReadOnly, selectedThu, phongHocList, isCurrentWeek]);

  // Xóa lịch dạy
  const handleDeleteSchedule = useCallback((idTkbTuan) => {
    if (!idTkbTuan) return;
    thongBao.xacNhan({
      tieuDe: 'Xóa Lịch Dạy',
      thongDiep: 'Bạn có chắc chắn muốn xóa lịch dạy này khỏi thời khóa biểu tuần?',
      loai: 'danger',
      nhanXacNhan: 'Xác nhận xóa',
      onXacNhan: async () => {
        try {
          dispatch({ type: 'SET_DELETING', payload: true });
          if (isTeacher) {
            await dichVuGiaoVien.xoaLichDay(idTkbTuan);
          } else {
            await dichVuThoiKhoaBieu.deleteThoiKhoaBieu(idTkbTuan);
          }
          dispatch({ type: 'SELECT_CARD', payload: null });
          thongBao.success('Đã xóa lịch dạy thành công!');
          await fetchTkbTheoTuan();
        } catch (err) {
          console.error('Lỗi khi xóa lịch dạy:', err);
          thongBao.error('Không thể xóa lịch dạy: ' + (err?.response?.data?.message || err?.message || 'Có lỗi xảy ra'));
        } finally {
          dispatch({ type: 'SET_DELETING', payload: false });
        }
      }
    });
  }, [isTeacher, fetchTkbTheoTuan]);

  if (error && (!tuanHocList || tuanHocList.length === 0)) {
    return (
      <div style={{ padding: '2rem 1rem' }}>
        <TrangBaoLoi loi={error} onThuLai={fetchTkbTheoTuan} />
      </div>
    );
  }

  // 9. Xử lý In thời khóa biểu chuẩn trang in A4
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // BƯỚC 1: NẾU CHƯA CHỌN CHI NHÁNH -> HIỂN THỊ MÀN HÌNH CHỌN CHI NHÁNH TRƯỚC TIÊN
  if (!selectedChiNhanhId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
        <KhungChonChiNhanhTkb
          chiNhanhList={chiNhanhList}
          loading={loadingChiNhanh}
          onSelectChiNhanh={(idCn) => dispatch({ type: 'SELECT_CHI_NHANH', payload: idCn })}
        />
      </div>
    );
  }

  // BƯỚC 2: SAU KHI ĐÃ CHỌN CHI NHÁNH -> VÀO BỐ CỤC THỜI KHÓA BIỂU CHI TIẾT (ẢNH 2)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* ── BẢN IN THỜI KHÓA BIỂU CHUYÊN BIỆT (CHỈ HIỂN THỊ KHI IN RA MÁY IN HOẶC XUẤT PDF) ── */}
      <div className="tkb-print-header" style={{ display: 'none' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2.5px solid #0F172A',
          paddingBottom: '0.65rem',
          marginBottom: '0.85rem'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: '#0284C7', letterSpacing: '0.04em' }}>
              {currentChiNhanh?.tenCn ? `TRUNG TÂM ĐÀO TẠO • ${currentChiNhanh.tenCn.toUpperCase()}` : 'TRUNG TÂM ĐÀO TẠO'}
            </div>
            <h1 style={{
              fontSize: '1.4rem',
              fontWeight: '900',
              color: '#0F172A',
              margin: '0.2rem 0',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}>
              THỜI KHÓA BIỂU {viewMode === 'room' ? `LỊCH HỌC ${selectedThu === 8 ? 'CHỦ NHẬT' : `THỨ ${selectedThu}`}` : 'LỊCH HỌC TOÀN TUẦN'}
            </h1>
            <div style={{ fontSize: '0.825rem', color: '#334155', display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {currentNamHoc?.tenNamHoc && (
                <span>Năm học: <strong>{currentNamHoc.tenNamHoc}</strong></span>
              )}
              {currentWeek?.tenTuan && (
                <span>Tuần học: <strong>{currentWeek.tenTuan}</strong></span>
              )}
              {weekDateRange?.start && weekDateRange?.end && (
                <span>
                  (Từ <strong>{new Date(weekDateRange.start).toLocaleDateString('vi-VN')}</strong> đến <strong>{new Date(weekDateRange.end).toLocaleDateString('vi-VN')}</strong>)
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.775rem', color: '#64748B' }}>
            <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.825rem' }}>
              Quy mô: <strong>{metrics.totalSlots}</strong> tiết • <strong>{metrics.uniqueClasses}</strong> lớp • <strong>{metrics.uniqueTeachers}</strong> giáo viên
            </div>
            <div style={{ marginTop: '0.35rem', color: '#64748B' }}>
              Ngày xuất bản in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Top Banner Header (ĐÃ BỎ BỘ CHỌN TUẦN) */}
      <div className="no-print">
        <ThanhDieuHuongTkb
          currentChiNhanh={currentChiNhanh}
          loading={loading}
          isReadOnly={isReadOnly}
          viewMode={viewMode}
          onChangeViewMode={(val) => dispatch({ type: 'SET_VIEW_MODE', payload: val })}
          onRefresh={fetchTkbTheoTuan}
          onOpenAddModal={() => handleOpenAddModal()}
          onChangeBranch={() => dispatch({ type: 'SELECT_CHI_NHANH', payload: null })}
          onPrint={handlePrint}
        />
      </div>

      {/* 2. Banner Cảnh báo Chế độ Chỉ xem nếu Năm học đã hoàn thành hoặc Tuần học đã qua */}
      {isReadOnly && (
        <div className="no-print" style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: isYearFinished ? '#FEF2F2' : '#FFFBEB',
          border: `1px solid ${isYearFinished ? '#FECACA' : '#FDE68A'}`,
          borderRadius: '14px',
          color: isYearFinished ? '#991B1B' : '#92400E',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          fontWeight: '700',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <Clock size={18} style={{ flexShrink: 0, color: isYearFinished ? '#DC2626' : '#D97706' }} />
          <span>
            {isYearFinished 
              ? `Năm học này đã hoàn thành hoặc kết thúc. Hệ thống tự động chuyển sang chế độ CHỈ XEM (Không thể thêm, xóa hoặc chỉnh sửa thời khóa biểu).`
              : `Tuần học này (${currentWeek?.moTa || (currentWeek?.soTuan ? 'Tuần ' + currentWeek.soTuan : 'Tuần đã chọn')}) đã trôi qua trong quá khứ. Hệ thống tự động chuyển sang chế độ CHỈ XEM.`}
          </span>
        </div>
      )}

      {/* 3. Thẻ tóm tắt Metrics (Tổng tiết, Lớp học, Giáo viên, Phòng học) */}
      <div className="no-print" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '0.65rem 0.85rem',
          borderRadius: '12px',
          border: '1px solid #DBDBDB',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EBF5FE', color: '#0095F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>TỔNG TIẾT</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>{metrics.totalSlots} Tiết</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '0.65rem 0.85rem',
          borderRadius: '12px',
          border: '1px solid #DBDBDB',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>LỚP HỌC</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>{metrics.uniqueClasses} Lớp</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '0.65rem 0.85rem',
          borderRadius: '12px',
          border: '1px solid #DBDBDB',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>GIÁO VIÊN</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>{metrics.uniqueTeachers} Thầy/Cô</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '0.65rem 0.85rem',
          borderRadius: '12px',
          border: '1px solid #DBDBDB',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600' }}>PHÒNG HỌC</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>{metrics.uniqueRooms} Phòng</div>
          </div>
        </div>
      </div>

      {/* 4. Thanh phân phối theo Thứ trong tuần (Ảnh 2) */}
      <div className="no-print">
        <ThanhPhanPhoiThu
          currentChiNhanh={currentChiNhanh}
          selectedThu={selectedThu}
          onSelectThu={(thu) => {
            dispatch({ type: 'SELECT_THU', payload: thu });
            setStoreSelectedThu?.(thu);
          }}
          sessionsCountByThu={sessionsCountByThu}
          isWeekPast={isWeekPast}
          isCurrentWeek={isCurrentWeek}
          isYearFinished={isYearFinished}
          weekDateRange={weekDateRange}
        />
      </div>

      {/* 5. Thanh công cụ lọc TKB (Ảnh 2) - Tối ưu hiệu năng: Nhận dispatch và options memoized */}
      <div className="no-print">
        <ThanhBoLocTkb
          user={user}
          filters={filters}
          options={filterOptions}
          dispatch={dispatch}
        />
      </div>

      {/* 6. Nội dung hiển thị Thời khóa biểu chính (Theo Phòng & Ca hoặc Theo Tuần) */}
      <div className="tkb-table-print-container">
        {viewMode === 'room' ? (
          /* Ma trận Theo Phòng & Ca tại Thứ được chọn (Ảnh 2) */
          <BangTkbTheoPhongVaCa
            selectedThu={selectedThu}
            currentChiNhanh={currentChiNhanh}
            phongHocList={phongHocList}
            loadingPhongHoc={loadingPhongHoc}
            roomCaMatrixMap={roomCaMatrixMap}
            isSlotPast={handleCheckSlotPast}
            onOpenAddModal={handleOpenAddModal}
            onSelectCard={(item) => dispatch({ type: 'SELECT_CARD', payload: item })}
            isWeekPast={isWeekPast}
            isCurrentWeek={isCurrentWeek}
            isYearFinished={isYearFinished}
            weekDateRange={weekDateRange}
          />
        ) : (
          /* Ma trận Theo Tuần (Thứ x Ca) */
          <BangTkbTheoTuan
            matrixMap={matrixMap}
            onSelectCard={(item) => dispatch({ type: 'SELECT_CARD', payload: item })}
          />
        )}
      </div>

      {/* 7. Modal Chi tiết tiết học & Xóa lịch */}
      {selectedCard && (
        <ChiTietTkbModal
          selectedCard={selectedCard}
          onClose={() => dispatch({ type: 'SELECT_CARD', payload: null })}
          onDelete={handleDeleteSchedule}
          deleting={deleting}
          isReadOnly={isReadOnly}
          isSlotPast={handleCheckSlotPast}
          currentWeek={currentWeek}
        />
      )}

      {/* 8. Modal Thêm lịch dạy mới */}
      <ModalThemLichDay
        isOpen={modalThem.isOpen}
        onClose={() => dispatch({ type: 'CLOSE_ADD_MODAL' })}
        selectedTuanId={selectedTuanHocId}
        initialPhongId={modalThem.preset.idPhong}
        initialCaHoc={modalThem.preset.caHoc}
        initialThu={modalThem.preset.thu}
        selectedChiNhanhId={selectedChiNhanhId}
        danhSachPhong={phongHocList}
        danhSachTuan={tuanHocList}
        onSuccess={fetchTkbTheoTuan}
        isWeekPast={isWeekPast}
        isCurrentWeek={isCurrentWeek}
        isYearFinished={isYearFinished}
        weekDateRange={weekDateRange}
      />
    </div>
  );
};

export default TrangThoiKhoaBieu;


