import React, { useEffect } from 'react';
import { Bell, Settings, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTrangThaiXacThuc } from '../trang_thai/useTrangThaiXacThuc';
import { LogoEduCenter } from '../thanh_phan/LogoEduCenter';
import BoChonNamKyHoc from '../thanh_phan/bang_dieu_khien/BoChonNamKyHoc';
import { useNamHocKyHocStore } from '../trang_thai/useNamHocKyHocStore';
import { useComponentTheme } from '../trang_thai/useComponentTheme';

const PhanDau = ({
  isMobile = false,
  sidebarOpen = false,
  onMenuToggle,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { user } = useTrangThaiXacThuc();
  const currentDnId = user?.idDoanhNghiep || 1;
  const { openDrawer } = useComponentTheme();

  const {
    namHocList,
    kyHocList,
    tuanHocList,
    selectedNamHocId,
    selectedKyHocId,
    selectedTuanHocId,
    selectedThu,
    loading,
    loadingKyHoc,
    loadingTuanHoc,
    fetchNamHoc,
    setSelectedNamHocId,
    setSelectedKyHocId,
    setSelectedTuanHocId,
    setSelectedThu,
    triggerRefresh
  } = useNamHocKyHocStore();

  useEffect(() => {
    if (currentDnId) {
      fetchNamHoc(currentDnId);
    }
  }, [currentDnId, fetchNamHoc]);

  const initials = user?.hoTen 
    ? user.hoTen.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : 'ND';

  return (
    <header 
      className="droplet-card"
      style={{
        height: isMobile ? '50px' : '64px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 0.65rem' : '0 1.25rem',
        zIndex: 40,
        borderRadius: isMobile ? '16px' : '20px',
        gap: isMobile ? '0.45rem' : '0.85rem',
        position: 'relative',
        transition: 'height 0.25s ease, padding 0.25s ease'
      }}
    >
      {/* ── BÊN TRÁI: Logo + Nút thu phóng (Desktop) hoặc Nút Menu (Mobile) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.65rem', flexShrink: 0 }}>
        {/* Mobile: Hamburger Button */}
        {isMobile && (
          <button
            onClick={onMenuToggle}
            type="button"
            className="droplet-circle"
            style={{
              width: '36px',
              height: '36px',
              color: sidebarOpen ? '#EF4444' : '#0284C7',
              border: `1.5px solid ${sidebarOpen ? '#FEE2E2' : '#DBEAFE'}`,
              backgroundColor: sidebarOpen ? '#FEF2F2' : '#EFF6FF',
              transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
              transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={sidebarOpen ? 'Đóng menu chức năng' : 'Mở menu chức năng'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        {/* Logo Biểu Tượng EduCenter */}
        <LogoEduCenter
          variant="icon-only"
          size={isMobile ? 30 : 38}
          asLink={true}
          to="/"
          title="EduCenter ERP - Về Trang Tổng Quan"
        />

        {/* Desktop: Nút Thu Phóng Sidebar (Collapse / Expand) */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            type="button"
            className="droplet-circle"
            style={{
              width: '36px',
              height: '36px',
              color: isCollapsed ? '#0284C7' : '#64748B',
              backgroundColor: isCollapsed ? '#EFF6FF' : '#FFFFFF',
              border: isCollapsed ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={isCollapsed ? "Mở rộng thanh chức năng" : "Thu gọn thanh chức năng (Tối đa hóa không gian)"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* ── Ở GIỮA: Thanh Chọn Năm Học, Kỳ Học & Tuần Học ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        overflow: 'visible'
      }}>
        <BoChonNamKyHoc
          isMobile={isMobile}
          namHocList={namHocList}
          kyHocList={kyHocList}
          tuanHocList={tuanHocList}
          selectedNamHocId={selectedNamHocId}
          selectedKyHocId={selectedKyHocId}
          selectedTuanHocId={selectedTuanHocId}
          selectedThu={selectedThu}
          onChangeNamHoc={setSelectedNamHocId}
          onChangeKyHoc={setSelectedKyHocId}
          onChangeTuanHoc={setSelectedTuanHocId}
          onChangeThu={setSelectedThu}
          onRefresh={triggerRefresh}
          loading={loading}
          loadingKyHoc={loadingKyHoc}
          loadingTuanHoc={loadingTuanHoc}
        />
      </div>

      {/* ── BÊN PHẢI: Actions + Avatar người dùng ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.35rem' : '0.65rem', flexShrink: 0 }}>
        {/* Nút Cài Đặt Giao Diện trên Mobile */}
        {isMobile && (
          <button 
            type="button"
            onClick={openDrawer}
            className="droplet-circle"
            style={{ width: '32px', height: '32px', color: '#64748B' }}
            title="Cài đặt giao diện"
          >
            <Settings size={16} />
          </button>
        )}

        {/* Chuông & Cài đặt — Hiển thị trên Desktop */}
        {!isMobile && (
          <>
            <button 
              type="button"
              className="droplet-circle"
              style={{ width: '38px', height: '38px', color: '#64748B', position: 'relative' }}
              title="Thông báo"
            >
              <Bell size={17} />
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '9px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)'
              }} />
            </button>

            <button 
              type="button"
              onClick={openDrawer}
              className="droplet-circle"
              style={{ width: '38px', height: '38px', color: '#64748B' }}
              title="Cài đặt giao diện (Trượt từ trái sang)"
            >
              <Settings size={17} />
            </button>
          </>
        )}

        {/* User Avatar */}
        <div 
          className="droplet-circle"
          style={{
            width: isMobile ? '32px' : '38px',
            height: isMobile ? '32px' : '38px',
            color: '#0F172A',
            fontSize: isMobile ? '0.75rem' : '0.825rem',
            fontWeight: '800'
          }}
          title={user?.hoTen || 'Người dùng'}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};

export default PhanDau;


