import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Calendar, 
  BookOpen, 
  DollarSign, 
  Building2,
  GraduationCap,
  ClipboardList,
  Layers,
  LogOut,
  Sparkles,
  Award,
  UserCheck,
  Clock,
  BookMarked,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useTrangThaiXacThuc } from '../trang_thai/useTrangThaiXacThuc';
import { useComponentTheme } from '../trang_thai/useComponentTheme';
import { LogoEduCenter } from '../thanh_phan/LogoEduCenter';

export interface MucDieuHuong {
  label: string;
  path: string;
  icon: React.ReactNode;
  moTa?: string;
  badge?: string;
}

export interface DieuHuongChucNangProps {
  vaiTro?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * Thanh điều hướng chức năng chính (Sidebar)
 * Cung cấp ma trận Button điều hướng độc lập dựa trên vai trò (Role-Based Matrix)
 * Hỗ trợ chế độ Thu gọn (Mini Icon Bar) & Mở rộng (Full Sidebar) trên Desktop, Drawer tiện ích trên Mobile
 */
export const DieuHuongChucNang: React.FC<DieuHuongChucNangProps> = ({
  vaiTro,
  isMobile = false,
  isOpen = true,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { user, logout } = useTrangThaiXacThuc();
  const { mode, applyToSidebar } = useComponentTheme();
  const isSidebarDark = mode === 'DARK' && applyToSidebar;
  const rawRole = String(vaiTro || user?.vaiTro || 'CHU_DOANH_NGHIEP').trim().toUpperCase();
  const currentRole = rawRole.startsWith('ROLE_') ? rawRole.replace('ROLE_', '') : rawRole;

  // 1. Tên hiển thị của từng Vai trò
  const roleTitle = useMemo(() => {
    switch (currentRole) {
      case 'ADMIN': return 'Quản Trị Viên';
      case 'CHU_DOANH_NGHIEP': return 'Chủ Doanh Nghiệp';
      case 'QUAN_LY': return 'Quản Lý Cơ Sở';
      case 'GIAO_VIEN': return 'Giáo Viên';
      case 'HOC_SINH': return 'Học Sinh / PH';
      default: return 'Thành Viên';
    }
  }, [currentRole]);

  // 2. Ma trận Button điều hướng chức năng theo Vai trò
  const danhSachButton: MucDieuHuong[] = useMemo(() => {
    switch (currentRole) {
      case 'ADMIN':
        return [
          { label: 'Tổng quan hệ thống', path: '/', icon: <LayoutDashboard size={18} /> },
          { label: 'Quản lý Doanh nghiệp', path: '/doanh-nghiep', icon: <Building2 size={18} /> },
          { label: 'Hệ thống Chi nhánh', path: '/chi-nhanh', icon: <MapPin size={18} /> },
          { label: 'Chủ sở hữu & Cổ đông', path: '/chu-co-dong', icon: <Users size={18} /> },
          { label: 'Nhân sự toàn hệ thống', path: '/giao-vien', icon: <GraduationCap size={18} /> },
          { label: 'Quản lý Năm học', path: '/nam-hoc', icon: <Calendar size={18} /> },
          { label: 'Kiểm soát Bộ môn', path: '/bo-mon', icon: <Layers size={18} />, badge: 'Mới' },
        ];

      case 'CHU_DOANH_NGHIEP':
        return [
          { label: 'Tổng quan trung tâm', path: '/', icon: <LayoutDashboard size={18} /> },
          { label: 'Hồ sơ Doanh nghiệp', path: '/doanh-nghiep', icon: <Building2 size={18} /> },
          { label: 'Chi nhánh & Cơ sở', path: '/chi-nhanh', icon: <MapPin size={18} /> },
          { label: 'Đội ngũ Giáo viên', path: '/giao-vien', icon: <Users size={18} /> },
          { label: 'Nhân sự khác', path: '/nhan-cong', icon: <UserCheck size={18} /> },
          { label: 'Quản lý Năm học', path: '/nam-hoc', icon: <Calendar size={18} /> },
          { label: 'Kiểm soát Bộ môn', path: '/bo-mon', icon: <Layers size={18} />, badge: 'Mới' },
          { label: 'Lớp học trung tâm', path: '/lop-hoc', icon: <BookOpen size={18} /> },
          { label: 'Thời khóa biểu tuần', path: '/thoi-khoa-bieu', icon: <Calendar size={18} /> },
          { label: 'Điểm danh học sinh', path: '/diem-danh', icon: <FileCheck size={18} /> },
          { label: 'Hồ sơ Học sinh', path: '/hoc-sinh', icon: <GraduationCap size={18} /> },
          { label: 'Hồ sơ Phụ huynh', path: '/phu-huynh', icon: <Users size={18} /> },
          { label: 'Đăng ký khóa học', path: '/dang-ky-hoc', icon: <ClipboardList size={18} /> },
          { label: 'Thu học phí học sinh', path: '/phieu-thu', icon: <DollarSign size={18} /> },
          { label: 'Bảng lương giáo viên', path: '/luong-giao-vien', icon: <Award size={18} /> },
          { label: 'Sổ quỹ & Tài chính', path: '/thu-chi', icon: <Layers size={18} /> },
          { label: 'Cổ đông & Góp vốn', path: '/chu-co-dong', icon: <Users size={18} /> },
        ];

      case 'QUAN_LY':
        return [
          { label: 'Tổng quan cơ sở', path: '/', icon: <LayoutDashboard size={18} /> },
          { label: 'Kiểm soát Bộ môn', path: '/bo-mon', icon: <Layers size={18} />, badge: 'Mới' },
          { label: 'Lớp học chi nhánh', path: '/lop-hoc', icon: <BookOpen size={18} /> },
          { label: 'Thời khóa biểu phòng', path: '/thoi-khoa-bieu', icon: <Calendar size={18} /> },
          { label: 'Điểm danh học sinh', path: '/diem-danh', icon: <FileCheck size={18} /> },
          { label: 'Hồ sơ học sinh', path: '/hoc-sinh', icon: <GraduationCap size={18} /> },
          { label: 'Đăng ký khóa học', path: '/dang-ky-hoc', icon: <ClipboardList size={18} /> },
          { label: 'Thu học phí học sinh', path: '/phieu-thu', icon: <DollarSign size={18} /> },
          { label: 'Sổ quỹ cơ sở', path: '/thu-chi', icon: <Layers size={18} /> },
        ];

      case 'GIAO_VIEN':
        return [
          { label: 'Tổng quan giảng dạy', path: '/', icon: <LayoutDashboard size={18} /> },
          { label: 'Kiểm soát Bộ môn', path: '/bo-mon', icon: <Layers size={18} />, badge: 'Mới' },
          { label: 'Lịch dạy tuần này', path: '/thoi-khoa-bieu', icon: <Calendar size={18} /> },
          { label: 'Lớp học phụ trách', path: '/lop-hoc', icon: <BookOpen size={18} /> },
          { label: 'Điểm danh lớp', path: '/diem-danh', icon: <FileCheck size={18} /> },
          { label: 'Thù lao & Lương', path: '/luong-giao-vien', icon: <Award size={18} /> },
        ];

      case 'HOC_SINH':
        return [
          { label: 'Lịch học của tôi', path: '/thoi-khoa-bieu', icon: <Calendar size={18} /> },
          { label: 'Đăng ký khóa học', path: '/dang-ky-hoc', icon: <ClipboardList size={18} /> },
          { label: 'Tra cứu học phí', path: '/phieu-thu', icon: <DollarSign size={18} /> },
        ];

      default:
        return [
          { label: 'Tổng quan', path: '/', icon: <LayoutDashboard size={18} /> },
          { label: 'Kiểm soát Bộ môn', path: '/bo-mon', icon: <Layers size={18} />, badge: 'Mới' },
          { label: 'Lớp học', path: '/lop-hoc', icon: <BookOpen size={18} /> },
          { label: 'Điểm danh', path: '/diem-danh', icon: <FileCheck size={18} /> },
          { label: 'Giáo viên', path: '/giao-vien', icon: <Users size={18} /> },
          { label: 'Chi nhánh', path: '/chi-nhanh', icon: <MapPin size={18} /> },
          { label: 'Thời khóa biểu', path: '/thoi-khoa-bieu', icon: <Calendar size={18} /> },
          { label: 'Thu học phí học sinh', path: '/phieu-thu', icon: <DollarSign size={18} /> },
          { label: 'Bảng lương giáo viên', path: '/luong-giao-vien', icon: <Award size={18} /> },
          { label: 'Sổ quỹ & Tài chính', path: '/thu-chi', icon: <Layers size={18} /> },
        ];
    }
  }, [currentRole]);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.location.href = '/login';
  };

  const initials = user?.hoTen 
    ? user.hoTen.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase()
    : 'ND';

  return (
    <aside 
      className="droplet-sidebar no-scrollbar"
      style={
        isMobile
          ? {
              /* Mobile: Gạt drawer từ bên TRÁI mượt mà */
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '85vw',
              height: '100vh',
              zIndex: 50,
              padding: '1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '0 24px 24px 0',
              boxSizing: 'border-box',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              transform: isOpen ? 'translateX(0)' : 'translateX(-105%)',
              transition: 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)',
              boxShadow: isOpen
                ? '8px 0 40px rgba(15, 23, 42, 0.2), 2px 0 8px rgba(0,0,0,0.06)'
                : 'none'
            }
          : {
              /* Desktop: Thu phóng linh hoạt (Mini bar 72px hoặc Mở rộng 260px) */
              width: isCollapsed ? '72px' : '260px',
              height: '100%',
              flexShrink: 0,
              padding: isCollapsed ? '1rem 0.45rem' : '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: '24px',
              boxSizing: 'border-box',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease'
            }
      }
    >
      {/* PHẦN TRÊN: Profile + Cụm Button Điều Hướng */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        
        {/* Mobile Header: Logo + Nút đóng nhanh */}
        {isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.65rem',
            borderBottom: isSidebarDark ? '1px solid #334155' : '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <LogoEduCenter variant="icon-only" size={28} asLink={false} />
              <span style={{ fontWeight: '800', fontSize: '0.925rem', color: isSidebarDark ? '#FFFFFF' : '#0F172A' }}>EduCenter ERP</span>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="droplet-circle"
              style={{
                width: '32px',
                height: '32px',
                color: isSidebarDark ? '#CBD5E1' : '#64748B',
                border: isSidebarDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isSidebarDark ? '#1E293B' : '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Đóng menu"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Profile Card người dùng */}
        {isCollapsed && !isMobile ? (
          /* Mini Profile Card khi Collapsed trên Desktop */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
            <div 
              className="droplet-circle"
              style={{
                width: '42px',
                height: '42px',
                color: isSidebarDark ? '#FFFFFF' : '#1E293B',
                backgroundColor: isSidebarDark ? '#1E293B' : '#FFFFFF',
                border: isSidebarDark ? '1px solid #334155' : '1px solid #E2E8F0',
                fontSize: '0.9rem',
                fontWeight: '800',
                cursor: 'default'
              }}
              title={`${user?.hoTen || 'Người dùng'} • ${roleTitle}`}
            >
              {initials}
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="droplet-circle"
              style={{
                width: '32px',
                height: '32px',
                color: isSidebarDark ? '#38BDF8' : '#0284C7',
                backgroundColor: isSidebarDark ? '#1E293B' : '#EFF6FF',
                border: isSidebarDark ? '1px solid #334155' : '1px solid #BFDBFE',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Mở rộng menu chức năng"
            >
              <ChevronRight size={16} />
            </button>
            <div style={{ width: '80%', height: '1px', backgroundColor: isSidebarDark ? '#334155' : '#E2E8F0', margin: '0.2rem 0' }} />
          </div>
        ) : (
          /* Full Profile Card */
          <>
            <div 
              className="droplet-card"
              style={{
                padding: '0.75rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.65rem',
                borderRadius: '18px',
                backgroundColor: isSidebarDark ? '#1E293B' : '#FFFFFF',
                border: isSidebarDark ? '1px solid #334155' : '1px solid rgba(255, 255, 255, 0.9)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                <div 
                  className="droplet-circle"
                  style={{
                    width: '38px',
                    height: '38px',
                    color: isSidebarDark ? '#FFFFFF' : '#1E293B',
                    backgroundColor: isSidebarDark ? '#0F172A' : '#FFFFFF',
                    border: isSidebarDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    flexShrink: 0
                  }}
                >
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: isSidebarDark ? '#FFFFFF' : '#0F172A',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user?.hoTen || 'Người dùng'}
                  </h4>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: isSidebarDark ? '#38BDF8' : '#0284C7', 
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '2px'
                  }}>
                    <Sparkles size={11} />
                    {roleTitle}
                  </span>
                </div>
              </div>

              {/* Nút thu gọn nhanh trên Desktop khi đang mở rộng */}
              {!isMobile && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="droplet-circle"
                  style={{
                    width: '28px',
                    height: '28px',
                    color: isSidebarDark ? '#CBD5E1' : '#64748B',
                    backgroundColor: isSidebarDark ? '#0F172A' : '#FFFFFF',
                    border: isSidebarDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Thu gọn menu chức năng"
                >
                  <ChevronLeft size={15} />
                </button>
              )}
            </div>

            {/* Tiêu đề mục điều hướng */}
            <div style={{
              fontSize: '0.68rem',
              fontWeight: '800',
              color: isSidebarDark ? '#94A3B8' : '#64748B',
              letterSpacing: '0.05em',
              padding: '0 0.35rem',
              textTransform: 'uppercase'
            }}>
              Chức năng cho {roleTitle}
            </div>
          </>
        )}

        {/* DANH SÁCH BUTTON ĐIỀU HƯỚNG THEO VAI TRÒ */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed && !isMobile ? '0.55rem' : '0.45rem' }}>
          {danhSachButton.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              end={item.path === '/'}
              onClick={isMobile ? onClose : undefined}
              style={{
                textDecoration: 'none',
                display: 'block'
              }}
            >
              {({ isActive }) => {
                /* Render dạng icon mini khi collapsed trên Desktop */
                if (isCollapsed && !isMobile) {
                  return (
                    <button
                      type="button"
                      className="droplet-pill"
                      title={item.label}
                      style={{
                        width: '44px',
                        height: '44px',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        borderRadius: '14px',
                        backgroundColor: isActive 
                          ? (isSidebarDark ? 'rgba(2, 132, 199, 0.3)' : '#EFF6FF') 
                          : (isSidebarDark ? '#1E293B' : '#FFFFFF'),
                        border: isActive 
                          ? (isSidebarDark ? '1.5px solid #38BDF8' : '1.5px solid #60A5FA') 
                          : (isSidebarDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                        color: isActive 
                          ? (isSidebarDark ? '#38BDF8' : '#1D4ED8') 
                          : (isSidebarDark ? '#CBD5E1' : '#64748B'),
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive 
                          ? (isSidebarDark ? '0 4px 14px -2px rgba(56, 189, 248, 0.25)' : '0 4px 12px -2px rgba(37, 99, 235, 0.22)') 
                          : '0 1px 2px rgba(15, 23, 42, 0.03)',
                        position: 'relative'
                      }}
                    >
                      <span style={{ 
                        color: isActive 
                          ? (isSidebarDark ? '#38BDF8' : '#2563EB') 
                          : (isSidebarDark ? '#CBD5E1' : '#64748B'), 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}>
                        {item.icon}
                      </span>
                      {isActive && (
                        <span style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isSidebarDark ? '#38BDF8' : '#2563EB',
                          boxShadow: isSidebarDark ? '0 0 6px #38BDF8' : '0 0 4px #3B82F6'
                        }} />
                      )}
                    </button>
                  );
                }

                /* Render dạng full pill button */
                return (
                  <button
                    type="button"
                    className="droplet-pill"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.68rem 0.9rem',
                      borderRadius: '16px',
                      backgroundColor: isActive 
                        ? (isSidebarDark ? 'rgba(2, 132, 199, 0.28)' : '#EFF6FF') 
                        : (isSidebarDark ? '#1E293B' : '#FFFFFF'),
                      border: isActive 
                        ? (isSidebarDark ? '1.5px solid #38BDF8' : '1.5px solid #60A5FA') 
                        : (isSidebarDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                      color: isActive 
                        ? (isSidebarDark ? '#38BDF8' : '#1D4ED8') 
                        : (isSidebarDark ? '#CBD5E1' : '#334155'),
                      fontWeight: isActive ? '800' : '600',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive 
                        ? (isSidebarDark ? '0 4px 14px -2px rgba(56, 189, 248, 0.25)' : '0 4px 14px -2px rgba(37, 99, 235, 0.18)') 
                        : '0 1px 3px rgba(15, 23, 42, 0.03)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ 
                        color: isActive 
                          ? (isSidebarDark ? '#38BDF8' : '#2563EB') 
                          : (isSidebarDark ? '#CBD5E1' : '#64748B'),
                        transition: 'color 0.2s ease',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        padding: '0.12rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor: isSidebarDark ? '#0284C7' : '#EFF6FF',
                        color: isSidebarDark ? '#FFFFFF' : '#2563EB',
                        border: isSidebarDark ? '1px solid #38BDF8' : '1px solid #BFDBFE'
                      }}>
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isSidebarDark ? '#38BDF8' : '#2563EB',
                        boxShadow: isSidebarDark ? '0 0 8px #38BDF8' : '0 0 6px #3B82F6'
                      }} />
                    ) : null}
                  </button>
                );
              }}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* PHẦN DƯỚI: Nút Đăng Xuất */}
      <div style={{ paddingTop: '0.85rem', borderTop: isSidebarDark ? '1px solid #334155' : '1px solid rgba(226, 232, 240, 0.7)' }}>
        {isCollapsed && !isMobile ? (
          <button
            onClick={handleLogout}
            type="button"
            className="droplet-pill"
            title="Đăng xuất khỏi hệ thống"
            style={{
              width: '44px',
              height: '44px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              backgroundColor: isSidebarDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
              border: isSidebarDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FEE2E2',
              color: isSidebarDark ? '#F87171' : '#DC2626',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={17} />
          </button>
        ) : (
          <button
            onClick={handleLogout}
            type="button"
            className="droplet-pill"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.7rem 0.9rem',
              borderRadius: '16px',
              backgroundColor: isSidebarDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
              border: isSidebarDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FEE2E2',
              color: isSidebarDark ? '#F87171' : '#DC2626',
              fontSize: '0.825rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={17} />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default DieuHuongChucNang;


