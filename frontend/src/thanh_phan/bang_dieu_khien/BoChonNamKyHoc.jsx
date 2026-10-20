import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  ChevronDown, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Clock, 
  CalendarDays,
  X,
  RotateCcw
} from 'lucide-react';
import { timTuanHocTheoThoiGianThuc, getThuHienTai } from '../../trang_thai/useNamHocKyHocStore';
import { useComponentTheme } from '../../trang_thai/useComponentTheme';

/**
 * Rút gọn tên kỳ học để hiển thị trên capsule hoặc nút nhỏ gọn:
 * "Học kỳ 1 (2026 - 2027)" -> "HK1"
 * "HK1 (2026 - 2027)" -> "HK1"
 * "Học kỳ 2" -> "HK2"
 * "Học kỳ hè" -> "HK hè"
 */
function rutGonTenKyHoc(tenKyHoc) {
  if (!tenKyHoc) return 'Tất cả kỳ';
  let clean = tenKyHoc.replace(/\s*\([^)]*\)/g, '').trim();
  clean = clean.replace(/^Học kỳ\s*/i, 'HK');
  clean = clean.replace(/^Học kì\s*/i, 'HK');
  clean = clean.replace(/^HK\s+/i, 'HK');
  return clean || tenKyHoc;
}

const DANH_SACH_THU = [
  { thu: null, label: 'Tất cả thứ', short: 'Cả tuần' },
  { thu: 2, label: 'Thứ 2', short: 'T2' },
  { thu: 3, label: 'Thứ 3', short: 'T3' },
  { thu: 4, label: 'Thứ 4', short: 'T4' },
  { thu: 5, label: 'Thứ 5', short: 'T5' },
  { thu: 6, label: 'Thứ 6', short: 'T6' },
  { thu: 7, label: 'Thứ 7', short: 'T7' },
  { thu: 8, label: 'Chủ Nhật', short: 'CN' }
];

/**
 * BoChonNamKyHoc:
 * Bộ điều khiển thời gian toàn cục: NĂM HỌC - HỌC KỲ - TUẦN HỌC - THỨ TRONG TUẦN
 * - Desktop: 4 Dropdown Capsule gọn gàng (Apple Liquid Glass UI), không còn dàn trải 10 button làm tràn màn hình.
 * - Mobile: 1 Capsule tóm tắt gọn gàng, chạm vào mở Bottom Sheet Modal trực quan dễ thao tác.
 */
const BoChonNamKyHoc = ({
  namHocList = [],
  kyHocList = [],
  tuanHocList = [],
  selectedNamHocId,
  selectedKyHocId,
  selectedTuanHocId,
  selectedThu,
  onChangeNamHoc,
  onChangeKyHoc,
  onChangeTuanHoc,
  onChangeThu,
  onRefresh,
  loading = false,
  loadingKyHoc = false,
  loadingTuanHoc = false,
  isMobile = false
}) => {
  const theme = useComponentTheme();
  const isDark = theme.mode === 'DARK' && (theme.applyToHeader ?? true);

  const [openYearMenu, setOpenYearMenu] = useState(false);
  const [openSemMenu, setOpenSemMenu] = useState(false);
  const [openWeekMenu, setOpenWeekMenu] = useState(false);
  const [openDayMenu, setOpenDayMenu] = useState(false);
  const [openMobileModal, setOpenMobileModal] = useState(false);

  const yearDropdownRef = useRef(null);
  const semDropdownRef = useRef(null);
  const weekDropdownRef = useRef(null);
  const dayDropdownRef = useRef(null);

  const thuHienTai = getThuHienTai();

  // Đóng các menu khi click ra ngoài trên desktop
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) setOpenYearMenu(false);
      if (semDropdownRef.current && !semDropdownRef.current.contains(e.target)) setOpenSemMenu(false);
      if (weekDropdownRef.current && !weekDropdownRef.current.contains(e.target)) setOpenWeekMenu(false);
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(e.target)) setOpenDayMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentNamHoc = namHocList.find(nh => nh.idNh === selectedNamHocId);
  const currentKyHoc = kyHocList.find(kh => kh.idKh === selectedKyHocId);
  const currentTuanHoc = tuanHocList.find(th => th.idTh === selectedTuanHocId);

  // Tuần học thực tế
  const realtimeTuanHoc = React.useMemo(() => {
    return timTuanHocTheoThoiGianThuc(
      tuanHocList,
      currentNamHoc?.ngayBatDau,
      currentNamHoc?.namBatDau
    );
  }, [tuanHocList, currentNamHoc]);

  const thuLabel = selectedThu 
    ? (selectedThu === 8 ? 'Chủ Nhật' : `Thứ ${selectedThu}`) 
    : 'Tất cả thứ';

  // ─────────────────────────────────────────────────────────────
  // 1. GIAO DIỆN CHO ĐIỆN THOẠI (Mobile Capsule + Bottom Sheet Modal)
  // ─────────────────────────────────────────────────────────────
  if (isMobile) {
    const shortYear = currentNamHoc 
      ? (currentNamHoc.namBatDau && currentNamHoc.namKetThuc 
          ? `${currentNamHoc.namBatDau?.toString().slice(-2)}-${currentNamHoc.namKetThuc?.toString().slice(-2)}` 
          : (currentNamHoc.tenNamHoc || ''))
      : '';
    const shortKy = rutGonTenKyHoc(currentKyHoc?.tenKyHoc);
    const shortTuan = currentTuanHoc ? `T.${currentTuanHoc.soTuan || currentTuanHoc.idTh}` : 'Cả tuần';
    const shortThu = selectedThu ? (selectedThu === 8 ? 'CN' : `T${selectedThu}`) : '';

    const mobileSummary = [shortYear, shortKy, shortTuan, shortThu].filter(Boolean).join(' • ');

    return (
      <>
        {/* Nút Capsule siêu nhỏ gọn trên Header Mobile */}
        <button
          type="button"
          onClick={() => setOpenMobileModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.32rem 0.65rem',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            color: isDark ? '#F8FAFC' : '#0F172A',
            fontWeight: '700',
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 6px rgba(15, 23, 42, 0.06)',
            maxWidth: 'min(280px, 62vw)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            outline: 'none',
            flexShrink: 1
          }}
          title="Nhấn để tùy chỉnh Năm, Thứ, Tuần, Kỳ"
        >
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
            color: isDark ? '#38BDF8' : '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Calendar size={11} />
          </div>
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            letterSpacing: '-0.1px',
            color: isDark ? '#F8FAFC' : '#0F172A'
          }}>
            {mobileSummary || 'Chọn thời gian'}
          </span>
          <ChevronDown size={12} style={{ color: isDark ? '#94A3B8' : '#94A3B8', flexShrink: 0 }} />
        </button>

        {/* Modal Bottom Sheet dùng createPortal gắn trực tiếp vào document.body tránh bị bẫy bởi backdrop-filter của Header */}
        {openMobileModal && typeof document !== 'undefined' && createPortal(
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: 0,
              margin: 0,
              boxSizing: 'border-box'
            }}
            onClick={() => setOpenMobileModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '480px',
                maxHeight: '88vh',
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                color: isDark ? '#F8FAFC' : '#0F172A',
                border: isDark ? '1px solid #334155' : 'none',
                borderRadius: '24px 24px 0 0',
                boxShadow: isDark ? '0 -10px 40px rgba(0, 0, 0, 0.5)' : '0 -10px 40px rgba(0, 0, 0, 0.25)',
                padding: '1.25rem 1.15rem calc(1.5rem + env(safe-area-inset-bottom, 0px))',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                overflowY: 'auto',
                boxSizing: 'border-box',
                animation: 'slideUpMobileModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <style>{`
                @keyframes slideUpMobileModal {
                  from { transform: translateY(100%); opacity: 0.6; }
                  to { transform: translateY(0); opacity: 1; }
                }
              `}</style>

              {/* Header Modal */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '40px', height: '4px', backgroundColor: isDark ? '#334155' : '#CBD5E1', borderRadius: '2px' }} />
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: isDark ? '#FFFFFF' : '#0F172A', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Calendar size={17} style={{ color: isDark ? '#38BDF8' : '#2563EB' }} />
                    Bộ Lọc Năm • Thứ • Tuần • Kỳ
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOpenMobileModal(false)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#CBD5E1' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* 1. Chọn Năm Học */}
              <div>
                <div style={{ fontSize: '0.725rem', fontWeight: '800', color: isDark ? '#94A3B8' : '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  1. Năm học
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {namHocList.map((nh) => {
                    const isSelected = nh.idNh === selectedNamHocId;
                    return (
                      <button
                        key={nh.idNh}
                        type="button"
                        onClick={() => onChangeNamHoc(nh.idNh)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '9999px',
                          border: isSelected 
                            ? (isDark ? '1.5px solid #38BDF8' : '1.5px solid #2563EB') 
                            : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                          backgroundColor: isSelected 
                            ? (isDark ? '#1E293B' : '#EFF6FF') 
                            : (isDark ? '#0F172A' : '#F8FAFC'),
                          color: isSelected 
                            ? (isDark ? '#38BDF8' : '#1D4ED8') 
                            : (isDark ? '#CBD5E1' : '#334155'),
                          fontWeight: isSelected ? '800' : '600',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {nh.tenNamHoc || (nh.namBatDau && nh.namKetThuc ? `${nh.namBatDau} - ${nh.namKetThuc}` : `Năm ${nh.idNh}`)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Chọn Kỳ Học */}
              <div>
                <div style={{ fontSize: '0.725rem', fontWeight: '800', color: isDark ? '#94A3B8' : '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  2. Học kỳ
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => onChangeKyHoc(null)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      border: selectedKyHocId === null 
                        ? (isDark ? '1.5px solid #38BDF8' : '1.5px solid #2563EB') 
                        : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                      backgroundColor: selectedKyHocId === null 
                        ? (isDark ? '#1E293B' : '#EFF6FF') 
                        : (isDark ? '#0F172A' : '#F8FAFC'),
                      color: selectedKyHocId === null 
                        ? (isDark ? '#38BDF8' : '#1D4ED8') 
                        : (isDark ? '#CBD5E1' : '#334155'),
                      fontWeight: selectedKyHocId === null ? '800' : '600',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Tất cả kỳ (ALL)
                  </button>
                  {kyHocList.map((kh) => {
                    const isSelected = kh.idKh === selectedKyHocId;
                    return (
                      <button
                        key={kh.idKh}
                        type="button"
                        onClick={() => onChangeKyHoc(kh.idKh)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '9999px',
                          border: isSelected 
                            ? (isDark ? '1.5px solid #38BDF8' : '1.5px solid #2563EB') 
                            : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                          backgroundColor: isSelected 
                            ? (isDark ? '#1E293B' : '#EFF6FF') 
                            : (isDark ? '#0F172A' : '#F8FAFC'),
                          color: isSelected 
                            ? (isDark ? '#38BDF8' : '#1D4ED8') 
                            : (isDark ? '#CBD5E1' : '#334155'),
                          fontWeight: isSelected ? '800' : '600',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {rutGonTenKyHoc(kh.tenKyHoc)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Chọn Tuần Học */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: '800', color: isDark ? '#94A3B8' : '#64748B', textTransform: 'uppercase' }}>
                    3. Tuần học
                  </span>
                  {realtimeTuanHoc && (
                    <button
                      type="button"
                      onClick={() => onChangeTuanHoc?.(realtimeTuanHoc.idTh)}
                      style={{
                        border: isDark ? '1px solid #059669' : 'none',
                        backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
                        color: isDark ? '#34D399' : '#15803D',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Sparkles size={11} />
                      Về tuần hiện tại (T.{realtimeTuanHoc.soTuan || realtimeTuanHoc.idTh})
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', maxHeight: '130px', overflowY: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => onChangeTuanHoc?.(null)}
                    style={{
                      padding: '0.325rem 0.7rem',
                      borderRadius: '9999px',
                      border: selectedTuanHocId === null 
                        ? (isDark ? '1.5px solid #34D399' : '1.5px solid #16A34A') 
                        : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                      backgroundColor: selectedTuanHocId === null 
                        ? (isDark ? '#064E3B40' : '#F0FDF4') 
                        : (isDark ? '#0F172A' : '#F8FAFC'),
                      color: selectedTuanHocId === null 
                        ? (isDark ? '#34D399' : '#15803D') 
                        : (isDark ? '#CBD5E1' : '#334155'),
                      fontWeight: selectedTuanHocId === null ? '800' : '600',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Tất cả tuần
                  </button>
                  {tuanHocList.map((th) => {
                    const isSelected = th.idTh === selectedTuanHocId;
                    const isRealtime = realtimeTuanHoc && th.idTh === realtimeTuanHoc.idTh;
                    return (
                      <button
                        key={th.idTh}
                        type="button"
                        onClick={() => onChangeTuanHoc?.(th.idTh)}
                        style={{
                          padding: '0.325rem 0.7rem',
                          borderRadius: '9999px',
                          border: isSelected 
                            ? (isDark ? '1.5px solid #34D399' : '1.5px solid #16A34A') 
                            : isRealtime 
                              ? (isDark ? '1px solid #059669' : '1px solid #86EFAC') 
                              : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                          backgroundColor: isSelected 
                            ? (isDark ? '#064E3B' : '#F0FDF4') 
                            : isRealtime 
                              ? (isDark ? '#064E3B30' : '#F0FDF4') 
                              : (isDark ? '#0F172A' : '#F8FAFC'),
                          color: isSelected 
                            ? (isDark ? '#34D399' : '#15803D') 
                            : (isDark ? '#CBD5E1' : '#334155'),
                          fontWeight: isSelected ? '800' : '600',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Tuần {th.soTuan || th.idTh}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Chọn Thứ Trong Tuần */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: '800', color: isDark ? '#94A3B8' : '#64748B', textTransform: 'uppercase' }}>
                    4. Thứ trong tuần
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeThu?.(thuHienTai)}
                    style={{
                      border: isDark ? '1px solid #D97706' : 'none',
                      backgroundColor: isDark ? '#78350F' : '#FEF3C7',
                      color: isDark ? '#FBBF24' : '#D97706',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <RotateCcw size={11} />
                    Về hôm nay ({thuHienTai === 8 ? 'Chủ Nhật' : `Thứ ${thuHienTai}`})
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {DANH_SACH_THU.map((item) => {
                    const isSelected = selectedThu === item.thu;
                    const isToday = item.thu === thuHienTai;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => onChangeThu?.(item.thu)}
                        style={{
                          padding: '0.325rem 0.7rem',
                          borderRadius: '9999px',
                          border: isSelected 
                            ? (isDark ? '1.5px solid #FB923C' : '1.5px solid #EA580C') 
                            : isToday 
                              ? (isDark ? '1px solid #D97706' : '1px solid #FCD34D') 
                              : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                          backgroundColor: isSelected 
                            ? (isDark ? '#78350F' : '#FFF7ED') 
                            : isToday 
                              ? (isDark ? '#78350F30' : '#FFFBEB') 
                              : (isDark ? '#0F172A' : '#F8FAFC'),
                          color: isSelected 
                            ? (isDark ? '#FB923C' : '#EA580C') 
                            : isToday 
                              ? (isDark ? '#FBBF24' : '#B45309') 
                              : (isDark ? '#CBD5E1' : '#334155'),
                          fontWeight: isSelected ? '800' : '600',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nút hành động cuối */}
              <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.5rem', borderTop: isDark ? '1px solid #1E293B' : '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '14px',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    color: isDark ? '#CBD5E1' : '#475569',
                    fontWeight: '700',
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Làm mới
                </button>
                <button
                  type="button"
                  onClick={() => setOpenMobileModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  Áp dụng & Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. GIAO DIỆN CHO MÁY TÍNH (Liquid Glass Capsule Bar 4 Chiều Tinh Gọn)
  // ─────────────────────────────────────────────────────────────
  return (
    <div 
      className="bo-chon-nam-ky-container"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.45rem',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '9999px',
        border: isDark ? '1px solid #334155' : '1px solid rgba(226, 232, 240, 0.95)',
        boxShadow: isDark 
          ? '0 4px 16px -2px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.08)' 
          : '0 4px 16px -2px rgba(15, 23, 42, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
        position: 'relative',
        zIndex: (openYearMenu || openSemMenu || openWeekMenu || openDayMenu) ? 150 : 20,
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* ── 1. NĂM HỌC DROPDOWN ── */}
      <div style={{ position: 'relative' }} ref={yearDropdownRef}>
        <button
          type="button"
          className={`bo-chon-capsule-btn ${openYearMenu ? 'is-open' : ''}`}
          onClick={() => {
            setOpenYearMenu(!openYearMenu);
            setOpenSemMenu(false);
            setOpenWeekMenu(false);
            setOpenDayMenu(false);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.32rem 0.65rem',
            backgroundColor: openYearMenu 
              ? (isDark ? '#26334A' : '#EFF6FF') 
              : (isDark ? '#1E293B' : '#F8FAFC'),
            border: openYearMenu 
              ? (isDark ? '1px solid #38BDF8' : '1px solid #BFDBFE') 
              : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: isDark ? '#F8FAFC' : '#0F172A',
            fontWeight: '700',
            transition: 'all 0.15s ease',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
          title="Chọn năm học áp dụng"
        >
          <Calendar size={13} style={{ color: isDark ? '#38BDF8' : '#2563EB', flexShrink: 0 }} />
          <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: '600' }}>Năm:</span>
          <span>{currentNamHoc ? (currentNamHoc.tenNamHoc || (currentNamHoc.namBatDau && currentNamHoc.namKetThuc ? `${currentNamHoc.namBatDau} - ${currentNamHoc.namKetThuc}` : `Năm ${currentNamHoc.idNh}`)) : 'Chọn năm'}</span>
          <ChevronDown size={13} style={{ color: isDark ? '#94A3B8' : '#94A3B8', transform: openYearMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>

        {openYearMenu && (
          <div 
            className="bo-chon-dropdown-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              minWidth: '190px',
              backgroundColor: isDark ? '#0F172A' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: isDark ? '0 20px 40px -4px rgba(0, 0, 0, 0.8)' : '0 16px 36px -4px rgba(15, 23, 42, 0.16)',
              padding: '0.35rem',
              zIndex: 200,
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: '800', color: isDark ? '#94A3B8' : '#94A3B8', textTransform: 'uppercase' }}>
              Danh sách năm học
            </div>
            {namHocList.map((nh) => {
              const isSelected = nh.idNh === selectedNamHocId;
              return (
                <div
                  key={nh.idNh}
                  className={`bo-chon-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChangeNamHoc(nh.idNh);
                    setOpenYearMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.7rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected 
                      ? (isDark ? '#38BDF8' : '#2563EB') 
                      : (isDark ? '#CBD5E1' : '#334155'),
                    backgroundColor: isSelected 
                      ? (isDark ? '#1E293B' : '#EFF6FF') 
                      : 'transparent',
                    border: isSelected 
                      ? (isDark ? '1.5px solid #38BDF8' : '1px solid transparent') 
                      : '1px solid transparent',
                    boxShadow: isSelected && isDark ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ color: isSelected ? (isDark ? '#38BDF8' : '#2563EB') : (isDark ? '#CBD5E1' : '#334155'), fontWeight: isSelected ? '700' : '500' }}>
                    {nh.tenNamHoc || (nh.namBatDau && nh.namKetThuc ? `${nh.namBatDau} - ${nh.namKetThuc}` : `Năm ${nh.idNh}`)}
                  </span>
                  {isSelected && <Check size={14} style={{ color: isDark ? '#38BDF8' : '#2563EB' }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bo-chon-divider" style={{ width: '1px', height: '16px', backgroundColor: isDark ? '#334155' : '#CBD5E1' }} />

      {/* ── 2. HỌC KỲ DROPDOWN ── */}
      <div style={{ position: 'relative' }} ref={semDropdownRef}>
        <button
          type="button"
          className={`bo-chon-capsule-btn ${openSemMenu ? 'is-open' : ''}`}
          onClick={() => {
            setOpenSemMenu(!openSemMenu);
            setOpenYearMenu(false);
            setOpenWeekMenu(false);
            setOpenDayMenu(false);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.32rem 0.65rem',
            backgroundColor: openSemMenu 
              ? (isDark ? '#26334A' : '#EFF6FF') 
              : (isDark ? '#1E293B' : '#F8FAFC'),
            border: openSemMenu 
              ? (isDark ? '1px solid #38BDF8' : '1px solid #BFDBFE') 
              : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: isDark ? '#F8FAFC' : '#0F172A',
            fontWeight: '700',
            transition: 'all 0.15s ease',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
          title="Chọn kỳ học áp dụng"
        >
          <Sparkles size={13} style={{ color: isDark ? '#38BDF8' : '#0284C7', flexShrink: 0 }} />
          <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: '600' }}>Kỳ:</span>
          <span>{currentKyHoc ? rutGonTenKyHoc(currentKyHoc.tenKyHoc) : 'Tất cả kỳ (ALL)'}</span>
          <ChevronDown size={13} style={{ color: isDark ? '#94A3B8' : '#94A3B8', transform: openSemMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>

        {openSemMenu && (
          <div 
            className="bo-chon-dropdown-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              minWidth: '200px',
              backgroundColor: isDark ? '#0F172A' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: isDark ? '0 20px 40px -4px rgba(0, 0, 0, 0.8)' : '0 16px 36px -4px rgba(15, 23, 42, 0.16)',
              padding: '0.35rem',
              zIndex: 200,
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: '800', color: isDark ? '#94A3B8' : '#94A3B8', textTransform: 'uppercase' }}>
              Danh sách học kỳ
            </div>

            {/* Option: Tất cả kỳ */}
            <div
              className={`bo-chon-item ${selectedKyHocId === null ? 'is-selected' : ''}`}
              onClick={() => {
                onChangeKyHoc(null);
                setOpenSemMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.7rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: selectedKyHocId === null ? '700' : '500',
                color: selectedKyHocId === null 
                  ? (isDark ? '#38BDF8' : '#2563EB') 
                  : (isDark ? '#CBD5E1' : '#334155'),
                backgroundColor: selectedKyHocId === null 
                  ? (isDark ? '#1E293B' : '#EFF6FF') 
                  : 'transparent',
                border: selectedKyHocId === null 
                  ? (isDark ? '1.5px solid #38BDF8' : '1px solid transparent') 
                  : '1px solid transparent',
                boxShadow: selectedKyHocId === null && isDark ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ color: selectedKyHocId === null ? (isDark ? '#38BDF8' : '#2563EB') : (isDark ? '#CBD5E1' : '#334155'), fontWeight: selectedKyHocId === null ? '700' : '500' }}>
                Tất cả kỳ học (ALL)
              </span>
              {selectedKyHocId === null && <Check size={14} style={{ color: isDark ? '#38BDF8' : '#2563EB' }} />}
            </div>

            {/* Các kỳ học cụ thể */}
            {kyHocList.map((kh) => {
              const isSelected = kh.idKh === selectedKyHocId;
              return (
                <div
                  key={kh.idKh}
                  className={`bo-chon-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChangeKyHoc(kh.idKh);
                    setOpenSemMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.7rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected 
                      ? (isDark ? '#38BDF8' : '#2563EB') 
                      : (isDark ? '#CBD5E1' : '#334155'),
                    backgroundColor: isSelected 
                      ? (isDark ? '#1E293B' : '#EFF6FF') 
                      : 'transparent',
                    border: isSelected 
                      ? (isDark ? '1.5px solid #38BDF8' : '1px solid transparent') 
                      : '1px solid transparent',
                    boxShadow: isSelected && isDark ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ color: isSelected ? (isDark ? '#38BDF8' : '#2563EB') : (isDark ? '#CBD5E1' : '#334155'), fontWeight: isSelected ? '700' : '500' }}>
                    {kh.tenKyHoc}
                  </span>
                  {isSelected && <Check size={14} style={{ color: isDark ? '#38BDF8' : '#2563EB' }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bo-chon-divider" style={{ width: '1px', height: '16px', backgroundColor: isDark ? '#334155' : '#CBD5E1' }} />

      {/* ── 3. TUẦN HỌC DROPDOWN ── */}
      <div style={{ position: 'relative' }} ref={weekDropdownRef}>
        <button
          type="button"
          className={`bo-chon-capsule-btn ${openWeekMenu ? 'is-open' : ''}`}
          onClick={() => {
            setOpenWeekMenu(!openWeekMenu);
            setOpenYearMenu(false);
            setOpenSemMenu(false);
            setOpenDayMenu(false);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.32rem 0.65rem',
            backgroundColor: openWeekMenu 
              ? (isDark ? '#064E3B40' : '#F0FDF4') 
              : (isDark ? '#1E293B' : '#F8FAFC'),
            border: openWeekMenu 
              ? (isDark ? '1px solid #34D399' : '1px solid #86EFAC') 
              : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: isDark ? '#F8FAFC' : '#0F172A',
            fontWeight: '700',
            transition: 'all 0.15s ease',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
          title="Chọn tuần học áp dụng"
        >
          <Clock size={13} style={{ color: isDark ? '#34D399' : '#16A34A', flexShrink: 0 }} />
          <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: '600' }}>Tuần:</span>
          <span>{currentTuanHoc ? `Tuần ${currentTuanHoc.soTuan || currentTuanHoc.idTh}` : 'Tất cả tuần'}</span>
          {realtimeTuanHoc && currentTuanHoc?.idTh === realtimeTuanHoc.idTh && (
            <span 
              className="bo-chon-tag-current" 
              style={{ 
                fontSize: '0.65rem', 
                backgroundColor: isDark ? '#064E3B' : '#DCFCE7', 
                color: isDark ? '#34D399' : '#15803D', 
                border: isDark ? '1px solid #059669' : 'none',
                padding: '0.05rem 0.35rem', 
                borderRadius: '9999px', 
                fontWeight: '800' 
              }}
            >
              Hiện tại
            </span>
          )}
          <ChevronDown size={13} style={{ color: isDark ? '#94A3B8' : '#94A3B8', transform: openWeekMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>

        {openWeekMenu && (
          <div 
            className="bo-chon-dropdown-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              minWidth: '220px',
              maxHeight: '260px',
              overflowY: 'auto',
              backgroundColor: isDark ? '#0F172A' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: isDark ? '0 20px 40px -4px rgba(0, 0, 0, 0.8)' : '0 16px 36px -4px rgba(15, 23, 42, 0.16)',
              padding: '0.35rem',
              zIndex: 200,
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: '800', color: isDark ? '#94A3B8' : '#94A3B8', textTransform: 'uppercase' }}>
              Danh sách tuần học
            </div>

            {realtimeTuanHoc && selectedTuanHocId !== realtimeTuanHoc.idTh && (
              <div
                className="bo-chon-quick-btn"
                onClick={() => {
                  onChangeTuanHoc?.(realtimeTuanHoc.idTh);
                  setOpenWeekMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.7rem',
                  marginBottom: '0.3rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: isDark ? '#34D399' : '#15803D',
                  backgroundColor: isDark ? '#064E3B30' : '#F0FDF4',
                  border: isDark ? '1px dashed #059669' : '1px dashed #86EFAC'
                }}
              >
                <Sparkles size={12} style={{ color: isDark ? '#34D399' : '#16A34A' }} />
                <span>Về tuần hiện tại (Tuần {realtimeTuanHoc.soTuan || realtimeTuanHoc.idTh})</span>
              </div>
            )}

            <div
              className={`bo-chon-item ${selectedTuanHocId === null ? 'is-selected' : ''}`}
              onClick={() => {
                onChangeTuanHoc?.(null);
                setOpenWeekMenu(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.7rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: selectedTuanHocId === null ? '700' : '500',
                color: selectedTuanHocId === null 
                  ? (isDark ? '#34D399' : '#16A34A') 
                  : (isDark ? '#CBD5E1' : '#334155'),
                backgroundColor: selectedTuanHocId === null 
                  ? (isDark ? '#064E3B' : '#F0FDF4') 
                  : 'transparent',
                border: selectedTuanHocId === null 
                  ? (isDark ? '1.5px solid #34D399' : '1px solid transparent') 
                  : '1px solid transparent',
                boxShadow: selectedTuanHocId === null && isDark ? '0 0 10px rgba(52, 211, 153, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ color: selectedTuanHocId === null ? (isDark ? '#34D399' : '#16A34A') : (isDark ? '#CBD5E1' : '#334155'), fontWeight: selectedTuanHocId === null ? '700' : '500' }}>
                Tất cả tuần
              </span>
              {selectedTuanHocId === null && <Check size={14} style={{ color: isDark ? '#34D399' : '#16A34A' }} />}
            </div>

            {tuanHocList.map((th) => {
              const isSelected = th.idTh === selectedTuanHocId;
              const isRealtime = realtimeTuanHoc && th.idTh === realtimeTuanHoc.idTh;
              return (
                <div
                  key={th.idTh}
                  className={`bo-chon-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChangeTuanHoc?.(th.idTh);
                    setOpenWeekMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.7rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected 
                      ? (isDark ? '#34D399' : '#16A34A') 
                      : (isDark ? '#CBD5E1' : '#334155'),
                    backgroundColor: isSelected 
                      ? (isDark ? '#064E3B' : '#F0FDF4') 
                      : 'transparent',
                    border: isSelected 
                      ? (isDark ? '1.5px solid #34D399' : '1px solid transparent') 
                      : '1px solid transparent',
                    boxShadow: isSelected && isDark ? '0 0 10px rgba(52, 211, 153, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ color: isSelected ? (isDark ? '#34D399' : '#16A34A') : (isDark ? '#CBD5E1' : '#334155'), fontWeight: isSelected ? '700' : '500' }}>
                      Tuần {th.soTuan || th.idTh}
                    </span>
                    {isRealtime && (
                      <span 
                        className="bo-chon-tag-current" 
                        style={{ 
                          fontSize: '0.65rem', 
                          backgroundColor: isDark ? '#064E3B' : '#DCFCE7', 
                          color: isDark ? '#34D399' : '#15803D', 
                          border: isDark ? '1px solid #059669' : 'none',
                          padding: '0.05rem 0.35rem', 
                          borderRadius: '9999px', 
                          fontWeight: '700' 
                        }}
                      >
                        Tuần này
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={14} style={{ color: isDark ? '#34D399' : '#16A34A' }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bo-chon-divider" style={{ width: '1px', height: '16px', backgroundColor: isDark ? '#334155' : '#CBD5E1' }} />

      {/* ── 4. THỨ TRONG TUẦN DROPDOWN ── */}
      <div style={{ position: 'relative' }} ref={dayDropdownRef}>
        <button
          type="button"
          className={`bo-chon-capsule-btn ${openDayMenu ? 'is-open' : ''}`}
          onClick={() => {
            setOpenDayMenu(!openDayMenu);
            setOpenYearMenu(false);
            setOpenSemMenu(false);
            setOpenWeekMenu(false);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.32rem 0.65rem',
            backgroundColor: openDayMenu 
              ? (isDark ? '#78350F40' : '#FFF7ED') 
              : (isDark ? '#1E293B' : '#F8FAFC'),
            border: openDayMenu 
              ? (isDark ? '1px solid #FB923C' : '1px solid #FDBA74') 
              : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
            borderRadius: '9999px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: isDark ? '#F8FAFC' : '#0F172A',
            fontWeight: '700',
            transition: 'all 0.15s ease',
            outline: 'none',
            whiteSpace: 'nowrap'
          }}
          title="Chọn thứ trong tuần áp dụng"
        >
          <CalendarDays size={13} style={{ color: isDark ? '#FB923C' : '#EA580C', flexShrink: 0 }} />
          <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: '600' }}>Thứ:</span>
          <span>{thuLabel}</span>
          {selectedThu === thuHienTai && (
            <span 
              className="bo-chon-tag-today" 
              style={{ 
                fontSize: '0.65rem', 
                backgroundColor: isDark ? '#78350F' : '#FEF3C7', 
                color: isDark ? '#FBBF24' : '#B45309', 
                border: isDark ? '1px solid #D97706' : 'none',
                padding: '0.05rem 0.35rem', 
                borderRadius: '9999px', 
                fontWeight: '800' 
              }}
            >
              Hôm nay
            </span>
          )}
          <ChevronDown size={13} style={{ color: isDark ? '#94A3B8' : '#94A3B8', transform: openDayMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </button>

        {openDayMenu && (
          <div 
            className="bo-chon-dropdown-menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              minWidth: '200px',
              backgroundColor: isDark ? '#0F172A' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              boxShadow: isDark ? '0 20px 40px -4px rgba(0, 0, 0, 0.8)' : '0 16px 36px -4px rgba(15, 23, 42, 0.16)',
              padding: '0.35rem',
              zIndex: 200,
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', fontWeight: '800', color: isDark ? '#94A3B8' : '#94A3B8', textTransform: 'uppercase' }}>
              Thứ trong tuần
            </div>

            {/* Quick Button: Về thứ hôm nay */}
            {selectedThu !== thuHienTai && (
              <div
                className="bo-chon-quick-btn"
                onClick={() => {
                  onChangeThu?.(thuHienTai);
                  setOpenDayMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.7rem',
                  marginBottom: '0.3rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: isDark ? '#FBBF24' : '#B45309',
                  backgroundColor: isDark ? '#78350F30' : '#FEF3C7',
                  border: isDark ? '1px dashed #D97706' : '1px dashed #FCD34D'
                }}
              >
                <RotateCcw size={12} style={{ color: isDark ? '#FBBF24' : '#D97706' }} />
                <span>Về hôm nay ({thuHienTai === 8 ? 'Chủ Nhật' : `Thứ ${thuHienTai}`})</span>
              </div>
            )}

            {DANH_SACH_THU.map((item) => {
              const isSelected = selectedThu === item.thu;
              const isToday = item.thu === thuHienTai;
              return (
                <div
                  key={item.label}
                  className={`bo-chon-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChangeThu?.(item.thu);
                    setOpenDayMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.7rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected 
                      ? (isDark ? '#FB923C' : '#EA580C') 
                      : (isDark ? '#CBD5E1' : '#334155'),
                    backgroundColor: isSelected 
                      ? (isDark ? '#78350F' : '#FFF7ED') 
                      : 'transparent',
                    border: isSelected 
                      ? (isDark ? '1.5px solid #FB923C' : '1px solid transparent') 
                      : '1px solid transparent',
                    boxShadow: isSelected && isDark ? '0 0 10px rgba(251, 146, 60, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ color: isSelected ? (isDark ? '#FB923C' : '#EA580C') : (isDark ? '#CBD5E1' : '#334155'), fontWeight: isSelected ? '700' : '500' }}>
                      {item.label}
                    </span>
                    {isToday && (
                      <span 
                        className="bo-chon-tag-today" 
                        style={{ 
                          fontSize: '0.65rem', 
                          backgroundColor: isDark ? '#78350F' : '#FEF3C7', 
                          color: isDark ? '#FBBF24' : '#B45309', 
                          border: isDark ? '1px solid #D97706' : 'none',
                          padding: '0.05rem 0.35rem', 
                          borderRadius: '9999px', 
                          fontWeight: '700' 
                        }}
                      >
                        Hôm nay
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={14} style={{ color: isDark ? '#FB923C' : '#EA580C' }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bo-chon-divider" style={{ width: '1px', height: '16px', backgroundColor: isDark ? '#334155' : '#CBD5E1' }} />

      {/* ── 5. NÚT LÀM MỚI (REFRESH BUTTON) ── */}
      <button
        type="button"
        className="bo-chon-refresh-btn"
        onClick={onRefresh}
        disabled={loading}
        title="Đồng bộ lại toàn bộ dữ liệu Năm, Thứ, Tuần, Kỳ"
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          color: isDark ? '#CBD5E1' : '#64748B',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
      >
        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};

export default BoChonNamKyHoc;
