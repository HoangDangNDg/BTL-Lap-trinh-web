import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowLeft,
  BookOpen,
  DoorClosed,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Phone,
  Mail,
  RefreshCw,
  GraduationCap
} from 'lucide-react';
import { dichVuThoiKhoaBieu } from '../../dich_vu/dichVuThoiKhoaBieu';
import { dichVuNhanSu } from '../../dich_vu/tao_tu_dong/dichVuNhanSu';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useNamHocKyHocStore, tinhKhoangNgayTuanHoc, timTuanHocTheoThoiGianThuc } from '../../trang_thai/useNamHocKyHocStore';
import { CA_HOC_CONFIG, THU_CONFIG, getThuHienTai, checkSlotPast } from '../../thanh_phan/thoi_khoa_bieu/caiDatTkb';
import { LiquidGlassTabs } from '../../components/ui/liquid-glass-button';

const TrangThoiKhoaBieuGiaoVien = () => {
  const { idGv } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Trạng thái Giáo viên
  const [teacher, setTeacher] = useState(location.state?.giaoVien || null);
  const [loadingTeacher, setLoadingTeacher] = useState(!location.state?.giaoVien);

  // 2. Trạng thái Tuần học & CSDL thời gian từ Store toàn cục
  const {
    namHocList = [],
    selectedNamHocId,
    kyHocList = [],
    selectedKyHocId,
    tuanHocList = [],
    selectedTuanHocId,
    setSelectedTuanHocId,
    selectedThu: storeSelectedThu,
    setSelectedThu: setStoreSelectedThu,
    fetchTuanHoc,
    chonTuanHienTai
  } = useNamHocKyHocStore();

  // Tự động nạp danh sách tuần nếu store chưa có
  const fetchedTuanRef = useRef(false);
  useEffect(() => {
    if ((!tuanHocList || tuanHocList.length === 0) && fetchTuanHoc && !fetchedTuanRef.current) {
      fetchedTuanRef.current = true;
      fetchTuanHoc(selectedKyHocId);
    }
  }, [tuanHocList, selectedKyHocId, fetchTuanHoc]);

  useEffect(() => {
    fetchedTuanRef.current = false;
  }, [selectedKyHocId]);

  // Danh sách tuần được sắp xếp tăng dần theo số thứ tự tuần
  const sortedTuanList = useMemo(() => {
    return [...(tuanHocList || [])].sort((a, b) => (a.soTuan || 0) - (b.soTuan || 0));
  }, [tuanHocList]);

  // Tự động chọn tuần học nếu chưa có tuần nào được chọn trong store
  useEffect(() => {
    if (!selectedTuanHocId && sortedTuanList.length > 0) {
      const currentNamHoc = (namHocList || []).find(nh => nh.idNh === selectedNamHocId);
      const matched = timTuanHocTheoThoiGianThuc(
        sortedTuanList,
        currentNamHoc?.ngayBatDau,
        currentNamHoc?.namBatDau
      );
      setSelectedTuanHocId(matched?.idTh || sortedTuanList[0].idTh);
    }
  }, [selectedTuanHocId, sortedTuanList, selectedNamHocId, namHocList, setSelectedTuanHocId]);

  // 3. Trạng thái Thời khóa biểu
  const [tkbData, setTkbData] = useState([]);
  const [loadingTkb, setLoadingTkb] = useState(false);

  // 4. Thứ đang chọn để xem chi tiết lịch trong ngày (mặc định là thứ hôm nay: 2 -> 8)
  const thuHomNay = useMemo(() => getThuHienTai(), []);
  const [selectedThu, setSelectedThu] = useState(storeSelectedThu || thuHomNay);

  useEffect(() => {
    if (storeSelectedThu && storeSelectedThu !== selectedThu) {
      setSelectedThu(storeSelectedThu);
    }
  }, [storeSelectedThu]);

  const handleSelectThu = (thu) => {
    setSelectedThu(thu);
    if (setStoreSelectedThu) {
      setStoreSelectedThu(thu);
    }
  };

  // Lấy ID giáo viên hiệu lực
  const effectiveGvId = useMemo(() => {
    if (idGv) return Number(idGv);
    if (teacher?.idGv) return Number(teacher.idGv);
    const params = new URLSearchParams(location.search);
    const qId = params.get('idGv');
    return qId ? Number(qId) : null;
  }, [idGv, teacher, location.search]);

  // Nạp thông tin giáo viên nếu chưa có sẵn trong state
  useEffect(() => {
    if (teacher && teacher.idGv === effectiveGvId) return;
    if (!effectiveGvId) return;

    let isMounted = true;
    setLoadingTeacher(true);
    dichVuNhanSu.getGiaoVien(effectiveGvId)
      .then((data) => {
        if (isMounted && data) {
          setTeacher(data);
        }
      })
      .catch((err) => {
        console.error('Lỗi tải thông tin giáo viên:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingTeacher(false);
      });

    return () => { isMounted = false; };
  }, [effectiveGvId]);

  // Nạp dữ liệu Thời khóa biểu của giáo viên theo BẮT BUỘC CẢ idGv VÀ idTh (Tuần học được chọn)
  const fetchTkbGiaoVien = useCallback(async () => {
    if (!effectiveGvId || !selectedTuanHocId) return;
    try {
      setLoadingTkb(true);
      const res = await dichVuThoiKhoaBieu.getThoiKhoaBieuTheoGiaoVien(effectiveGvId, selectedTuanHocId);
      setTkbData(res || []);
    } catch (err) {
      console.error('Lỗi nạp thời khóa biểu giáo viên:', err);
      setTkbData([]);
    } finally {
      setLoadingTkb(false);
    }
  }, [effectiveGvId, selectedTuanHocId]);

  useEffect(() => {
    if (effectiveGvId && selectedTuanHocId) {
      fetchTkbGiaoVien();
    }
  }, [fetchTkbGiaoVien, effectiveGvId, selectedTuanHocId]);

  // Năm học, kỳ học và tuần học đang chọn
  const selectedNamHoc = useMemo(() => {
    return (namHocList || []).find(nh => nh.idNh === selectedNamHocId) || null;
  }, [namHocList, selectedNamHocId]);

  const selectedKyHoc = useMemo(() => {
    return (kyHocList || []).find(kh => kh.idKh === selectedKyHocId) || null;
  }, [kyHocList, selectedKyHocId]);

  const activeTuanObj = useMemo(() => {
    return (tuanHocList || []).find(t => t.idTh === selectedTuanHocId) || null;
  }, [tuanHocList, selectedTuanHocId]);

  // Khoảng ngày của tuần đang chọn
  const weekRange = useMemo(() => {
    if (!activeTuanObj) return null;
    return tinhKhoangNgayTuanHoc(activeTuanObj, selectedNamHoc?.ngayBatDau, selectedNamHoc?.namBatDau);
  }, [activeTuanObj, selectedNamHoc]);

  // Lấy ngày cụ thể tương ứng với từng Thứ (2 -> 8) trong tuần đang chọn
  const getDateOfThu = useCallback((thu) => {
    if (!weekRange?.start) return '';
    const dayOffset = (thu === 8 ? 6 : thu - 2);
    const d = new Date(weekRange.start);
    d.setDate(d.getDate() + dayOffset);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [weekRange]);

  // Lọc an toàn dữ liệu chỉ thuộc đúng tuần đang chọn (chống trùng lặp chéo tuần)
  const currentWeekTkbData = useMemo(() => {
    if (!tkbData || !Array.isArray(tkbData)) return [];
    if (!selectedTuanHocId) return tkbData;
    return tkbData.filter(item => !item.idTh || item.idTh === selectedTuanHocId);
  }, [tkbData, selectedTuanHocId]);

  // Phân loại TKB theo từng Thứ (2 -> 8)
  const tkbByThu = useMemo(() => {
    const map = { 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };
    (currentWeekTkbData || []).forEach(item => {
      const thu = Number(item.thu);
      if (map[thu]) {
        map[thu].push(item);
      }
    });
    // Sắp xếp theo ca học tăng dần
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => (a.caHoc || 0) - (b.caHoc || 0));
    });
    return map;
  }, [currentWeekTkbData]);

  // Danh sách lịch học trong ngày đang chọn
  const dailySlots = useMemo(() => {
    return tkbByThu[selectedThu] || [];
  }, [tkbByThu, selectedThu]);

  // Thống kê nhanh chỉ số của tuần đang chọn
  const stats = useMemo(() => {
    const totalWeekly = currentWeekTkbData.length;
    const todayCount = (tkbByThu[thuHomNay] || []).length;
    const uniqueClasses = new Set(currentWeekTkbData.map(t => t.idLop).filter(Boolean)).size;
    return { totalWeekly, todayCount, uniqueClasses };
  }, [currentWeekTkbData, tkbByThu, thuHomNay]);

  // Chuyển tuần kế trước / kế tiếp
  const handlePrevWeek = () => {
    if (!sortedTuanList.length || !selectedTuanHocId) return;
    const idx = sortedTuanList.findIndex(t => t.idTh === selectedTuanHocId);
    if (idx > 0) {
      setSelectedTuanHocId(sortedTuanList[idx - 1].idTh);
    }
  };

  const handleNextWeek = () => {
    if (!sortedTuanList.length || !selectedTuanHocId) return;
    const idx = sortedTuanList.findIndex(t => t.idTh === selectedTuanHocId);
    if (idx >= 0 && idx < sortedTuanList.length - 1) {
      setSelectedTuanHocId(sortedTuanList[idx + 1].idTh);
    }
  };

  const handleCurrentWeek = () => {
    if (chonTuanHienTai) {
      chonTuanHienTai();
    }
  };

  // Avatar viết tắt
  const getInitials = (name) => {
    if (!name) return 'GV';
    return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      width: '100%',
      paddingBottom: '2.5rem',
      animation: 'fadeIn 0.25s ease-out'
    }}>

      {/* ── THANH TIÊU ĐỀ & ĐIỀU HƯỚNG QUAY LẠI ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.25rem 1.65rem',
          borderRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="droplet-pill"
            title="Quay lại hồ sơ giáo viên"
            style={{
              width: '42px',
              height: '42px',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              borderRadius: '12px'
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#64748B' }}>
              <span>Đội ngũ Giáo viên</span>
              <span>/</span>
              <span>{teacher?.hoTen || 'Chi tiết'}</span>
              <span>/</span>
              <strong style={{ color: '#0284C7' }}>Thời Khóa Biểu Giảng Dạy</strong>
            </div>
            <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
              Thời Khóa Biểu & Lịch Dạy Giáo Viên
            </h1>
          </div>
        </div>

        <button
          onClick={fetchTkbGiaoVien}
          className="droplet-pill"
          title="Làm mới thời khóa biểu"
          style={{
            height: '42px',
            padding: '0 1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#0F172A',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            borderRadius: '12px'
          }}
        >
          <RefreshCw size={16} className={loadingTkb ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* ── THẺ THÔNG TIN TỔNG QUAN GIÁO VIÊN ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.5rem 1.75rem',
          borderRadius: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Cột 1: Profile giáo viên */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
          {teacher?.avatar ? (
            <img
              src={teacher.avatar}
              alt={teacher.hoTen}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #0284C7',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
              }}
            />
          ) : (
            <div 
              className="droplet-circle"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                fontSize: '1.4rem',
                fontWeight: '800'
              }}
            >
              {getInitials(teacher?.hoTen)}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#0F172A' }}>
                {teacher?.hoTen || (loadingTeacher ? 'Đang tải thông tin...' : 'Giáo viên')}
              </h2>
              <span className={`badge ${teacher?.xoa ? 'badge-danger' : 'badge-success'}`}>
                {teacher?.xoa ? 'Nghỉ việc' : 'Đang công tác'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.35rem', fontSize: '0.825rem', color: '#64748B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Building2 size={14} style={{ color: '#0284C7' }} />
                <span>Cơ sở: <strong>{teacher?.doanhNghiep?.tenDn || 'Trung Tâm Giáo Dục'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {teacher?.sdt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={13} style={{ color: '#10B981' }} />
                    {teacher.sdt}
                  </span>
                )}
                {teacher?.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={13} style={{ color: '#0284C7' }} />
                    {teacher.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cột 2: Thống kê nhanh chỉ số giảng dạy */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#F8FAFC',
          borderRadius: '18px',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Hôm nay</span>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0284C7', marginTop: '0.1rem' }}>
              {stats.todayCount} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748B' }}>ca</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Cả tuần</span>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#10B981', marginTop: '0.1rem' }}>
              {stats.totalWeekly} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748B' }}>tiết</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>Lớp phụ trách</span>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#8B5CF6', marginTop: '0.1rem' }}>
              {stats.uniqueClasses} <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#64748B' }}>lớp</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── THANH CHỌN TUẦN HỌC & MỐC THỜI GIAN ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1rem 1.5rem',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="droplet-circle" style={{ width: '40px', height: '40px', backgroundColor: '#EFF6FF', color: '#2563EB' }}>
            <Calendar size={20} />
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
              {selectedNamHoc ? (selectedNamHoc.tenNamHoc ? `Năm học ${selectedNamHoc.tenNamHoc}` : (selectedNamHoc.namBatDau && selectedNamHoc.namKetThuc ? `Năm học ${selectedNamHoc.namBatDau} - ${selectedNamHoc.namKetThuc}` : `Năm học #${selectedNamHoc.idNh}`)) : ''} 
              {selectedKyHoc ? ` • ${selectedKyHoc.tenKh || `Kỳ ${selectedKyHoc.thuTuKy}`}` : ''}
            </div>
            <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>
              {activeTuanObj?.moTa || (activeTuanObj ? `Tuần ${activeTuanObj.soTuan}` : 'Chọn tuần học')}
              {!activeTuanObj?.moTa?.includes('(') && weekRange?.start && weekRange?.end && (
                <span style={{ fontSize: '0.85rem', color: '#0284C7', marginLeft: '0.5rem', fontWeight: '600' }}>
                  ({String(weekRange.start.getDate()).padStart(2, '0')}/{String(weekRange.start.getMonth() + 1).padStart(2, '0')} - {String(weekRange.end.getDate()).padStart(2, '0')}/{String(weekRange.end.getMonth() + 1).padStart(2, '0')})
                </span>
              )}
            </strong>
          </div>
        </div>

        {/* Nút điều hướng tuần */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handlePrevWeek}
            className="droplet-pill"
            title="Tuần trước"
            style={{ width: '38px', height: '38px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} />
          </button>

          <select
            value={selectedTuanHocId || ''}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val) setSelectedTuanHocId(val);
            }}
            className="droplet-pill"
            style={{
              height: '38px',
              padding: '0 1rem',
              border: '1px solid #E2E8F0',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: '#0F172A',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {sortedTuanList.map((tuan) => (
              <option key={tuan.idTh} value={tuan.idTh}>
                {tuan.moTa || `Tuần ${tuan.soTuan}`}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextWeek}
            className="droplet-pill"
            title="Tuần sau"
            style={{ width: '38px', height: '38px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={handleCurrentWeek}
            className="droplet-pill droplet-pill-mint"
            style={{ height: '38px', padding: '0 1rem', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
          >
            Tuần Hiện Tại
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ── PHÂN KHU 1: CÁC LỊCH HỌC TRONG NGÀY (HÔM NAY / THỨ ĐƯỢC CHỌN) ── */}
      {/* ========================================================================= */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.75rem',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #0284C7'
        }}
      >
        {/* Tiêu đề phân khu 1 & Bộ chọn Thứ trong tuần */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #F1F5F9'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} style={{ color: '#0284C7' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                Lịch Dạy Trong Ngày: {THU_CONFIG.find(t => t.thu === selectedThu)?.label}
                {selectedThu === thuHomNay && (
                  <span className="badge badge-success" style={{ marginLeft: '0.6rem', fontSize: '0.75rem' }}>
                    Hôm Nay
                  </span>
                )}
              </h3>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#64748B' }}>
              {weekRange?.start && `Ngày ${getDateOfThu(selectedThu)} • `} 
              Tổng cộng có <strong>{dailySlots.length}</strong> ca giảng dạy trong ngày này
            </p>
          </div>

          {/* Quick tabs chọn nhanh các thứ */}
          <div style={{
            display: 'flex',
            gap: '0.35rem',
            backgroundColor: '#F1F5F9',
            padding: '4px',
            borderRadius: '16px',
            overflowX: 'auto',
            maxWidth: '100%'
          }}>
            {THU_CONFIG.map((item) => {
              const isSelected = selectedThu === item.thu;
              const isToday = thuHomNay === item.thu;
              const count = (tkbByThu[item.thu] || []).length;

              return (
                <button
                  key={item.thu}
                  onClick={() => handleSelectThu(item.thu)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                    color: isSelected ? '#0284C7' : '#475569',
                    fontWeight: isSelected ? '800' : '600',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{item.short}</span>
                  {count > 0 && (
                    <span style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#0284C7' : '#CBD5E1',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800'
                    }}>
                      {count}
                    </span>
                  )}
                  {isToday && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nội dung danh sách các ca học trong ngày */}
        {loadingTkb ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: '#0284C7' }} />
            <p>Đang tải lịch dạy trong ngày...</p>
          </div>
        ) : dailySlots.length === 0 ? (
          <div style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: '20px',
            border: '2px dashed #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div className="droplet-circle" style={{ width: '52px', height: '52px', backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1E293B' }}>
                Không có lịch dạy vào {THU_CONFIG.find(t => t.thu === selectedThu)?.label}
              </h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                Giáo viên không có tiết dạy nào được xếp vào ngày này. Bạn có thể chọn các thứ khác ở trên để xem lịch học.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}>
            {dailySlots.map((slot) => {
              const caInfo = CA_HOC_CONFIG.find(c => c.ca === slot.caHoc) || {
                label: `Ca ${slot.caHoc || 1}`,
                time: `${slot.gioBatDau || '07:30'} - ${slot.gioKetThuc || '09:30'}`,
                buoi: 'Học',
                color: '#0284C7'
              };

              const isPast = checkSlotPast(
                slot.thu,
                slot.caHoc,
                slot.gioKetThuc,
                selectedNamHoc?.daHoanThanh,
                false,
                weekRange,
                activeTuanObj?.idTh === selectedTuanHocId
              );

              return (
                <div
                  key={slot.idTkbTuan}
                  className="droplet-card"
                  style={{
                    padding: '1.35rem',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    border: '1px solid #E2E8F0',
                    backgroundColor: isPast ? '#F8FAFC' : '#FFFFFF',
                    opacity: isPast ? 0.85 : 1,
                    boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.05)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {/* Hàng 1: Ca học & Khung giờ */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        style={{
                          backgroundColor: `${caInfo.color}15`,
                          color: caInfo.color,
                          fontWeight: '800',
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '10px'
                        }}
                      >
                        {caInfo.label} ({caInfo.buoi})
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} style={{ color: '#64748B' }} />
                        {slot.gioBatDau ? `${slot.gioBatDau.substring(0, 5)} - ${slot.gioKetThuc ? slot.gioKetThuc.substring(0, 5) : ''}` : caInfo.time}
                      </span>
                    </div>

                    <span className={`badge ${isPast ? 'badge-secondary' : 'badge-success'}`}>
                      {isPast ? 'Đã kết thúc' : 'Sắp diễn ra'}
                    </span>
                  </div>

                  {/* Hàng 2: Tên Lớp & Khóa học */}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                      {slot.tenLop || `Lớp học #${slot.idLop}`}
                    </h4>
                    {slot.tenKhoaHoc && (
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#0284C7', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <BookOpen size={13} />
                        {slot.tenKhoaHoc}
                      </p>
                    )}
                  </div>

                  {/* Hàng 3: Phòng học & Chi nhánh */}
                  <div style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.825rem',
                    color: '#475569'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <DoorClosed size={14} style={{ color: '#0284C7' }} />
                      <span>Phòng: <strong style={{ color: '#0F172A' }}>{slot.tenPhong || 'Chưa xếp phòng'}</strong></span>
                    </div>
                    {slot.tenChiNhanh && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Building2 size={14} style={{ color: '#10B981' }} />
                        <span>Cơ sở: <strong>{slot.tenChiNhanh}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ── PHÂN KHU 2: LIST LỊCH DẠY HỌC TRONG CÁC THỨ (THỨ 2 ĐẾN CHỦ NHẬT) ── */}
      {/* ========================================================================= */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.75rem',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #10B981'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} style={{ color: '#10B981' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                Danh Sách Lịch Dạy Theo Các Thứ Trong Tuần
              </h3>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#64748B' }}>
              Toàn bộ kế hoạch giảng dạy từ Thứ 2 đến Chủ Nhật trong {activeTuanObj?.moTa || 'tuần này'}
            </p>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Bấm vào bất kỳ thứ nào để xem chi tiết ở phân khu bên trên
          </div>
        </div>

        {/* Lưới 7 Cột biểu diễn các Thứ (Thứ 2 -> Chủ Nhật) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {THU_CONFIG.map((col) => {
            const slotsOfCol = tkbByThu[col.thu] || [];
            const isToday = col.thu === thuHomNay;
            const isSelected = col.thu === selectedThu;
            const dateStr = getDateOfThu(col.thu);

            return (
              <div
                key={col.thu}
                onClick={() => handleSelectThu(col.thu)}
                className="droplet-card"
                style={{
                  padding: '1.15rem',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  border: isSelected ? '2px solid #3B82F6' : (isToday ? '2px solid #A7F3D0' : '1px solid #E2E8F0'),
                  cursor: 'pointer',
                  minHeight: '220px',
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Header Ngày Thứ */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ fontSize: '1rem', color: isSelected ? '#1E40AF' : '#0F172A' }}>
                        {col.label}
                      </strong>
                      {isToday && (
                        <span style={{
                          backgroundColor: '#ECFDF5',
                          color: '#065F46',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '8px'
                        }}>
                          Hôm nay
                        </span>
                      )}
                    </div>
                    {dateStr && (
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Ngày {dateStr}</span>
                    )}
                  </div>

                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: slotsOfCol.length > 0 ? (isSelected ? '#2563EB' : '#0284C7') : '#E2E8F0',
                    color: slotsOfCol.length > 0 ? '#FFFFFF' : '#94A3B8',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {slotsOfCol.length}
                  </span>
                </div>

                {/* Danh sách các buổi học của Thứ này */}
                {slotsOfCol.length === 0 ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94A3B8',
                    fontSize: '0.8rem',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    Nghỉ dạy
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                    {slotsOfCol.map((item) => {
                      const caConfig = CA_HOC_CONFIG.find(c => c.ca === item.caHoc);
                      const timeStr = item.gioBatDau ? `${item.gioBatDau.substring(0, 5)} - ${item.gioKetThuc ? item.gioKetThuc.substring(0, 5) : ''}` : caConfig?.time;

                      return (
                        <div
                          key={item.idTkbTuan}
                          style={{
                            padding: '0.75rem 0.85rem',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '14px',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.35rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              color: caConfig?.color || '#0284C7',
                              backgroundColor: `${caConfig?.color || '#0284C7'}15`,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px'
                            }}>
                              Ca {item.caHoc || 1}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
                              {timeStr}
                            </span>
                          </div>

                          <strong style={{ fontSize: '0.9rem', color: '#0F172A', wordBreak: 'break-word' }}>
                            {item.tenLop || `Lớp #${item.idLop}`}
                          </strong>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748B' }}>
                            <DoorClosed size={12} style={{ color: '#0284C7' }} />
                            <span>{item.tenPhong || 'Chưa xếp phòng'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TrangThoiKhoaBieuGiaoVien;
