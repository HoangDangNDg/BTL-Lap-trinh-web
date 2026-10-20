import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  BookOpen, 
  Layers, 
  Users, 
  Search, 
  CheckCircle2, 
  MapPin, 
  Check, 
  Calendar, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Filter 
} from 'lucide-react';

/**
 * =========================================================================
 * COMPONENT: THANH CHỌN PHÂN CẤP ĐÀO TẠO (REUSABLE HIERARCHICAL SELECTOR)
 * =========================================================================
 * - Dùng chung cho cả Trang Điểm Danh và Trang Thu Học Phí.
 * - Quy trình chuẩn 3 tầng phân cấp + Breadcrumbs 4 bước:
 *   1. Chi nhánh
 *   2. Lớp học chi nhánh trong kỳ học (kèm bộ lọc chuyên môn, search, 2 tabs Chưa HT & Đã HT)
 *   3. Khóa học thuộc lớp học
 *   4. Nghiệp vụ (Kiểm soát học phí / Điểm danh học sinh)
 */
export default function ThanhChonPhanCapDaoTao({
  // Quản lý bước tiến trình (1, 2, 3, 4)
  currentStep = 1,
  onChuyenBuoc,
  nghiepVuTitle = 'Nghiệp Vụ Đào Tạo',
  nghiepVuIcon,

  // Tầng 1: Chi nhánh
  chiNhanhList = [],
  selectedCn = null,
  onSelectChiNhanh,
  loadingInit = false,

  // Tầng 2: Lớp học
  currentKyHocName = 'Tất cả kỳ học',
  boMonList = [],
  selectedBoMonId = null,
  onSelectBoMon,
  searchLopKw = '',
  onChangeSearchLop,
  tabLopTrangThai = 'CHUA_HOAN_THANH',
  onChangeTabLop,
  lopChuaHoanThanh = [],
  lopDaHoanThanh = [],
  selectedLopHoc = null,
  onSelectLopHoc,
  loadingLopHoc = false,

  // Tầng 3: Khóa học thuộc lớp
  khoaHocList = [],
  selectedKhoaHoc = null,
  onSelectKhoaHoc,
  loadingKhoaHoc = false
}) {
  const [isBoMonOpen, setIsBoMonOpen] = useState(false);
  const boMonDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boMonDropdownRef.current && !boMonDropdownRef.current.contains(event.target)) {
        setIsBoMonOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBoMonObj = boMonList.find(bm => bm.idBoMon === selectedBoMonId);
  const currentBoMonLabel = selectedBoMonObj ? selectedBoMonObj.tenBoMon : 'Tất cả chuyên môn';

  const displayClasses = tabLopTrangThai === 'CHUA_HOAN_THANH' ? lopChuaHoanThanh : lopDaHoanThanh;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* ── BREADCRUMB TRACKER TIẾN TRÌNH 4 BƯỚC (HỖ TRỢ ROLLBACK & CHUYỂN BƯỚC NHANH) ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '0.9rem 1.5rem',
          borderRadius: '18px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}
      >
        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>
          Tiến trình:
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {/* Bước 1: Chi nhánh */}
          <button
            type="button"
            onClick={() => onChuyenBuoc && onChuyenBuoc(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: currentStep === 1 ? '#EFF6FF' : '#F1F5F9',
              color: currentStep === 1 ? '#2563EB' : '#475569',
              fontWeight: currentStep === 1 ? '800' : '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Building2 size={13} />
            <span>1. {selectedCn ? selectedCn.tenCn : 'Chọn Chi Nhánh'}</span>
          </button>

          <ChevronRight size={13} style={{ color: '#94A3B8' }} />

          {/* Bước 2: Lớp học */}
          <button
            type="button"
            onClick={() => onChuyenBuoc && onChuyenBuoc(2)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: currentStep === 2 ? '#EFF6FF' : '#F1F5F9',
              color: currentStep === 2 ? '#2563EB' : '#475569',
              fontWeight: currentStep === 2 ? '800' : '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={13} />
            <span>2. {selectedLopHoc ? selectedLopHoc.tenLop : 'Chọn Lớp Học'}</span>
          </button>

          <ChevronRight size={13} style={{ color: '#94A3B8' }} />

          {/* Bước 3: Khóa học */}
          <button
            type="button"
            onClick={() => onChuyenBuoc && onChuyenBuoc(3)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: currentStep === 3 ? '#EFF6FF' : '#F1F5F9',
              color: currentStep === 3 ? '#2563EB' : '#475569',
              fontWeight: currentStep === 3 ? '800' : '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={13} />
            <span>3. {selectedKhoaHoc ? selectedKhoaHoc.tenKhoaHoc : 'Chọn Khóa Học'}</span>
          </button>

          <ChevronRight size={13} style={{ color: '#94A3B8' }} />

          {/* Bước 4: Nghiệp vụ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '10px',
              backgroundColor: currentStep === 4 ? '#EFF6FF' : '#F8FAFC',
              color: currentStep === 4 ? '#2563EB' : '#94A3B8',
              fontWeight: currentStep === 4 ? '800' : '600',
              fontSize: '0.82rem'
            }}
          >
            {nghiepVuIcon || <CheckCircle2 size={13} />}
            <span>4. {nghiepVuTitle}</span>
          </div>
        </div>
      </div>

      {/* ── TẦNG 1: CHỌN CƠ SỞ CHI NHÁNH ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.35rem 1.6rem',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} style={{ color: '#2563EB' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
              1. Chi Nhánh
            </h3>
          </div>
          {selectedCn && (
            <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: '700' }}>
              Đang chọn: {selectedCn.tenCn}
            </span>
          )}
        </div>

        {loadingInit ? (
          <div style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>Đang tải danh sách cơ sở chi nhánh...</div>
        ) : chiNhanhList.length === 0 ? (
          <div style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.85rem' }}>Chưa có cơ sở chi nhánh nào.</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '0.85rem'
          }}>
            {chiNhanhList.map((cn) => {
              const isSelected = selectedCn?.idCn === cn.idCn;
              return (
                <div
                  key={cn.idCn}
                  onClick={() => onSelectChiNhanh && onSelectChiNhanh(cn)}
                  className="droplet-card"
                  style={{
                    padding: '0.9rem 1.15rem',
                    borderRadius: '16px',
                    backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? '#2563EB' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: isSelected ? '800' : '700', color: isSelected ? '#1E40AF' : '#1E293B' }}>
                        {cn.tenCn}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                        <MapPin size={11} /> {cn.diaChi || 'Trụ sở'}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TẦNG 2: CHỌN LỚP HỌC CHI NHÁNH TRONG KỲ HỌC ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.35rem 1.6rem',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={18} style={{ color: '#0284C7' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
              2. Lớp Học
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Bộ lọc Chuyên môn tùy biến hiện đại (Custom Dropdown) */}
            <div ref={boMonDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                onClick={() => setIsBoMonOpen(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '12px',
                  border: isBoMonOpen ? '1.5px solid #0284C7' : '1px solid #CBD5E1',
                  backgroundColor: isBoMonOpen ? '#F0F9FF' : '#FFFFFF',
                  boxShadow: isBoMonOpen ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Filter size={14} style={{ color: '#0284C7' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: selectedBoMonId ? '#0284C7' : '#334155' }}>
                  {currentBoMonLabel}
                </span>
                <ChevronDown 
                  size={14} 
                  style={{ 
                    color: '#64748B', 
                    transform: isBoMonOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.2s ease' 
                  }} 
                />
              </button>

              {isBoMonOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    zIndex: 50,
                    minWidth: '220px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid rgba(226, 232, 240, 0.9)',
                    boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.15)',
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                >
                  <div
                    onClick={() => {
                      onSelectBoMon && onSelectBoMon(null);
                      setIsBoMonOpen(false);
                    }}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '10px',
                      backgroundColor: !selectedBoMonId ? '#EFF6FF' : 'transparent',
                      color: !selectedBoMonId ? '#1D4ED8' : '#334155',
                      fontWeight: !selectedBoMonId ? '800' : '600',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={e => {
                      if (selectedBoMonId) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={e => {
                      if (selectedBoMonId) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span>Tất cả chuyên môn</span>
                    {!selectedBoMonId && <Check size={14} style={{ color: '#2563EB' }} />}
                  </div>

                  {boMonList.map(bm => {
                    const isSelected = selectedBoMonId === bm.idBoMon;
                    return (
                      <div
                        key={bm.idBoMon}
                        onClick={() => {
                          onSelectBoMon && onSelectBoMon(bm.idBoMon);
                          setIsBoMonOpen(false);
                        }}
                        style={{
                          padding: '0.5rem 0.85rem',
                          borderRadius: '10px',
                          backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                          color: isSelected ? '#1D4ED8' : '#334155',
                          fontWeight: isSelected ? '800' : '600',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.12s ease'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span>{bm.tenBoMon}</span>
                        {isSelected && <Check size={14} style={{ color: '#2563EB' }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HAI TABS TÁCH BIỆT: CHƯA HOÀN THÀNH & ĐÃ HOÀN THÀNH */}
        <div style={{ display: 'flex', gap: '0.65rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
          <button
            type="button"
            onClick={() => onChangeTabLop && onChangeTabLop('CHUA_HOAN_THANH')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '12px',
              border: tabLopTrangThai === 'CHUA_HOAN_THANH' ? '1px solid #16A34A' : '1px solid #E2E8F0',
              backgroundColor: tabLopTrangThai === 'CHUA_HOAN_THANH' ? '#F0FDF4' : '#FFFFFF',
              color: tabLopTrangThai === 'CHUA_HOAN_THANH' ? '#15803D' : '#475569',
              fontSize: '0.82rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={14} />
            <span>Lớp Chưa Hoàn Thành / Đang Học ({lopChuaHoanThanh.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTabLop && onChangeTabLop('DA_HOAN_THANH')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '12px',
              border: tabLopTrangThai === 'DA_HOAN_THANH' ? '1px solid #0284C7' : '1px solid #E2E8F0',
              backgroundColor: tabLopTrangThai === 'DA_HOAN_THANH' ? '#F0F9FF' : '#FFFFFF',
              color: tabLopTrangThai === 'DA_HOAN_THANH' ? '#0369A1' : '#475569',
              fontSize: '0.82rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={14} />
            <span>Lớp Đã Hoàn Thành ({lopDaHoanThanh.length})</span>
          </button>
        </div>

        {/* LƯỚI THẺ LỚP HỌC */}
        {loadingLopHoc ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
            Đang tải danh sách lớp học...
          </div>
        ) : displayClasses.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
            {tabLopTrangThai === 'CHUA_HOAN_THANH'
              ? 'Chi nhánh này hiện không có lớp nào đang học / chưa hoàn thành.'
              : 'Chi nhánh này chưa có lớp nào đã hoàn thành.'}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '0.85rem'
          }}>
            {displayClasses.map(cls => {
              const isSelected = selectedLopHoc?.idLop === cls.idLop;

              return (
                <div
                  key={cls.idLop || cls.maLop}
                  onClick={() => onSelectLopHoc && onSelectLopHoc(cls)}
                  className="droplet-card"
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                    boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div style={{ 
                      fontSize: '0.92rem', 
                      fontWeight: '800', 
                      color: isSelected ? '#0369A1' : '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {cls.tenLop}
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} style={{ color: '#0284C7', flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isSelected ? '#0369A1' : '#64748B', marginBottom: '0.35rem' }}>
                    {cls.khoaHoc?.tenKhoaHoc || cls.monHoc?.tenMon || 'Chương trình đào tạo'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Users size={12} /> {cls.soHocSinh || 0}/{cls.siSoToiDa || 30} HS
                    </span>
                    <span>•</span>
                    <span style={{ 
                      color: cls.trangThai === 'HOAN_THANH' ? '#0284C7' : '#16A34A',
                      fontWeight: '700'
                    }}>
                      {cls.trangThai === 'HOAN_THANH' ? 'Đã hoàn thành' : 'Đang học'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TẦNG 3: CHỌN KHÓA HỌC THUỘC LỚP HỌC ── */}
      {selectedLopHoc ? (
        <div 
          className="droplet-card"
          style={{
            padding: '1.35rem 1.6rem',
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.15rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: '#9333EA' }} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                3. Khóa Học Thuộc Lớp: <span style={{ color: '#0284C7' }}>{selectedLopHoc.tenLop}</span>
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#64748B',
                backgroundColor: '#F1F5F9',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px'
              }}>
                {khoaHocList.length} khóa học khả dụng
              </span>
            </div>
          </div>

          {loadingKhoaHoc ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
              Đang tải danh sách khóa học của lớp...
            </div>
          ) : khoaHocList.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
              Lớp học này hiện chưa có khóa học nào được cấu hình.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '0.6rem',
              scrollbarWidth: 'thin'
            }}>
              {khoaHocList.map(kh => {
                const isSelected = selectedKhoaHoc?.idKhoaHoc === kh.idKhoaHoc;
                const fee = Number(kh.giaTien || kh.hocPhi || 0);

                return (
                  <div
                    key={kh.idKhoaHoc}
                    onClick={() => onSelectKhoaHoc && onSelectKhoaHoc(kh)}
                    className="droplet-card"
                    style={{
                      minWidth: '220px',
                      maxWidth: '260px',
                      padding: '1rem',
                      borderRadius: '16px',
                      backgroundColor: isSelected ? '#F0FDF4' : '#FFFFFF',
                      border: isSelected ? '2px solid #16A34A' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{
                        fontSize: '0.88rem',
                        fontWeight: isSelected ? '800' : '700',
                        color: isSelected ? '#15803D' : '#0F172A',
                        lineHeight: '1.3'
                      }}>
                        {kh.tenKhoaHoc}
                      </span>
                      {isSelected && <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {kh.boMon?.tenBoMon || 'Khóa học chuyên môn'}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '0.5rem',
                      borderTop: '1px dashed #E2E8F0'
                    }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '800', color: isSelected ? '#15803D' : '#2563EB' }}>
                        {fee.toLocaleString('vi-VN')} đ
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        Chuẩn kỳ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div 
          className="droplet-card"
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            borderRadius: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px dashed #CBD5E1'
          }}
        >
          <BookOpen size={36} style={{ color: '#94A3B8', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#334155' }}>
            Vui lòng chọn một lớp học ở bước 2 phía trên
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>
            Sau khi chọn lớp học, các khóa học tương ứng của lớp sẽ xuất hiện tại đây.
          </div>
        </div>
      )}

    </div>
  );
}
