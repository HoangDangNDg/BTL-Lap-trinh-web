import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import DieuHuongChucNang from './DieuHuongChucNang';
import PhanDau from './PhanDau';
import ThongBaoLoiThongMinh from '../thanh_phan/ThongBaoLoiThongMinh';
import BoThongBaoChuyenBiet from '../thanh_phan/BoThongBaoChuyenBiet';
import DrawerCaiDatGiaoDien from '../thanh_phan/cai_dat/DrawerCaiDatGiaoDien';
import { useTrangThaiXacThuc } from '../trang_thai/useTrangThaiXacThuc';
import { dichVuXacThuc } from '../dich_vu/dichVuXacThuc';

const MOBILE_BREAKPOINT = 768;

const BoCucChinh = () => {
  const { user, isAuthenticated } = useTrangThaiXacThuc();
  const isAuthCookie = dichVuXacThuc.isAuthenticated();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    if (!mobile) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  if (!isAuthenticated && !isAuthCookie) {
    return <Navigate to="/login" replace />;
  }

  const toggleMobileSidebar = () => setSidebarOpen(prev => !prev);
  const closeMobileSidebar = () => setSidebarOpen(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      padding: isMobile ? '0.35rem 0.5rem 0.5rem' : '1rem 1.5rem',
      gap: isMobile ? '0.45rem' : '1rem',
      boxSizing: 'border-box',
      backgroundColor: 'transparent',
      position: 'relative'
    }}>
      {/* ── THÔNG BÁO LỖI THÔNG MINH TOÀN CỤC ── */}
      <ThongBaoLoiThongMinh />

      {/* ── BỘ THÔNG BÁO CHUYÊN BIỆT & MODAL HOÀN TẤT TOÀN CỤC ── */}
      <BoThongBaoChuyenBiet />

      {/* ── KHỐI CÀI ĐẶT GIAO DIỆN HỆ THỐNG (ĐỘC LẬP TÁCH BIỆT KHỎI THANH TRÊN, TRƯỢT TỪ TRÁI SANG) ── */}
      <DrawerCaiDatGiaoDien />

      {/* ── OVERLAY MÀN HÌNH NHỎ (Khi mở drawer trên Mobile) ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 48,
            transition: 'opacity 0.3s ease',
            animation: 'fadeIn 0.25s ease'
          }}
        />
      )}

      {/* ── HEADER CỐ ĐỊNH TRÊN CÙNG: Logo, Năm/Kỳ học, Hành động ── */}
      <PhanDau
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        onMenuToggle={toggleMobileSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* ── KHUNG THÂN ỨNG DỤNG: Cụm Button điều hướng & Bố cục hiển thị nội dung CÙNG CẤP ── */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        gap: isMobile ? 0 : '1rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* BỐ CỤC 1: CỤM BUTTON ĐIỀU HƯỚNG CHỨC NĂNG THEO VAI TRÒ (CÙNG CẤP) */}
        <DieuHuongChucNang
          vaiTro={user?.vaiTro}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onClose={closeMobileSidebar}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* BỐ CỤC 2: VÙNG HIỂN THỊ NỘI DUNG TRANG (CÙNG CẤP) */}
        <main
          className="vung-noi-dung-chinh animate-fade-in"
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: isMobile ? '2px' : '4px',
            paddingBottom: isMobile ? '1rem' : '1.5rem',
            position: 'relative'
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BoCucChinh;


