import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Palette, 
  X, 
  Check, 
  Sun, 
  Moon, 
  Layers, 
  RotateCcw, 
  Sliders, 
  Sparkles,
  LayoutTemplate,
  CreditCard,
  MenuSquare,
  Monitor
} from 'lucide-react';
import { useComponentTheme } from '../../trang_thai/useComponentTheme';

const DrawerCaiDatGiaoDien = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const {
    mode,
    applyToBackground,
    applyToCards,
    applyToHeader,
    applyToSidebar,
    applyToPills,
    isDrawerOpen,
    closeDrawer,
    setMode,
    toggleTarget,
    setApplyAll,
    resetToDefault
  } = useComponentTheme();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isDrawerOpen;
  const onClose = propOnClose || closeDrawer;
  const isDark = mode === 'DARK';
  const allSelected = Boolean(applyToBackground && applyToCards && applyToHeader && applyToSidebar && applyToPills);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* ── 1. LỚP PHỦ MỜ NỀN TOÀN MÀN HÌNH (BACKDROP) ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 99998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        aria-hidden={!isOpen}
      />

      {/* ── 2. KHỐI CÀI ĐẶT TRƯỢT TỪ TRÁI SANG TOÀN MÀN HÌNH (OFF-CANVAS DRAWER) ── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          width: '380px',
          maxWidth: '88vw',
          zIndex: 99999,
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderRight: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
          boxShadow: isOpen ? '16px 0 45px rgba(0, 0, 0, 0.35)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.36s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.36s ease, background-color 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: isDark ? '#F8FAFC' : '#0F172A'
        }}
        aria-label="Cài đặt giao diện hệ thống"
      >
        {/* ── Header của Drawer ── */}
        <div
          style={{
            padding: '1.15rem 1.35rem',
            borderBottom: isDark ? '1px solid #1E293B' : '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark 
              ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' 
              : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isDark
                  ? 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)'
                  : 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                color: isDark ? '#FFFFFF' : '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)'
              }}
            >
              <Palette size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.975rem', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', lineHeight: 1.2 }}>
                Cài đặt giao diện
              </h3>
              <p style={{ margin: 0, fontSize: '0.725rem', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>
                Màu sắc nền & thẻ component
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="droplet-circle"
            style={{
              width: '32px',
              height: '32px',
              color: isDark ? '#CBD5E1' : '#64748B',
              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0'
            }}
            title="Đóng cài đặt"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Nội dung cuộn được (Body) ── */}
        <div
          className="no-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.35rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.4rem'
          }}
        >
          {/* ── PHẦN 1: CHỌN CHẾ ĐỘ MÀU SẮC ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
              <Sparkles size={15} color="#0284C7" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1. Chế độ màu sắc
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {/* Lựa chọn 1: Trắng chữ đen */}
              <button
                type="button"
                onClick={() => setMode('LIGHT')}
                style={{
                  padding: '0.85rem 0.75rem',
                  borderRadius: '14px',
                  border: mode === 'LIGHT' ? '2px solid #0284C7' : (isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0'),
                  backgroundColor: mode === 'LIGHT' ? (isDark ? '#1E293B' : '#F0F9FF') : (isDark ? '#0B0F19' : '#FFFFFF'),
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: mode === 'LIGHT' ? '0 4px 14px rgba(2, 132, 199, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Sun size={17} color="#F59E0B" />
                  </div>
                  {mode === 'LIGHT' && (
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#0284C7',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                    Trắng chữ đen
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '2px' }}>
                    Sáng tự nhiên (Mặc định)
                  </div>
                </div>
              </button>

              {/* Lựa chọn 2: Đen chữ trắng */}
              <button
                type="button"
                onClick={() => setMode('DARK')}
                style={{
                  padding: '0.85rem 0.75rem',
                  borderRadius: '14px',
                  border: mode === 'DARK' ? '2px solid #38BDF8' : (isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0'),
                  backgroundColor: mode === 'DARK' ? (isDark ? '#1E293B' : '#0F172A') : (isDark ? '#0B0F19' : '#F8FAFC'),
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: mode === 'DARK' ? '0 6px 18px rgba(0, 0, 0, 0.4)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Moon size={17} color="#38BDF8" />
                  </div>
                  {mode === 'DARK' && (
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#38BDF8',
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Đen chữ trắng
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                    Tối sang trọng, êm mắt
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ── PHẦN 2: CHỌN ĐOẠN THẺ CÙNG 1 LOẠI ĐỂ ÁP DỤNG ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Layers size={15} color="#0284C7" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  2. Thành phần áp dụng
                </span>
              </div>
              <button
                type="button"
                onClick={() => setApplyAll(!allSelected)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#38BDF8' : '#0284C7',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                {allSelected ? 'Bỏ chọn hết' : 'Chọn tất cả'}
              </button>
            </div>

            <p style={{ margin: '0 0 0.75rem', fontSize: '0.725rem', color: isDark ? '#94A3B8' : '#64748B', lineHeight: 1.4 }}>
              Đổi màu nền toàn màn hình và tùy chỉnh theo từng nhóm đoạn thẻ cùng loại:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {/* Thẻ 0: Nền toàn trang (html, body) */}
              <div
                onClick={() => toggleTarget('applyToBackground')}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  border: applyToBackground ? '1.5px solid #0284C7' : (isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'),
                  backgroundColor: isDark 
                    ? (applyToBackground ? '#1E293B' : '#0B0F19') 
                    : (applyToBackground ? '#F0F9FF' : '#FFFFFF'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#334155' : '#E0E7FF',
                      color: isDark ? '#A5B4FC' : '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Monitor size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        Nền toàn trang ứng dụng
                      </span>
                      <code style={{ fontSize: '0.675rem', backgroundColor: isDark ? '#334155' : '#E2E8F0', padding: '1px 5px', borderRadius: '4px', color: isDark ? '#CBD5E1' : '#475569' }}>
                        html, body
                      </code>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '1px' }}>
                      Đổi cả nền ứng dụng sang đen chữ trắng
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={applyToBackground}
                  onChange={() => {}}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#0284C7',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Thẻ 1: Thẻ nội dung chính (.droplet-card) */}
              <div
                onClick={() => toggleTarget('applyToCards')}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  border: applyToCards ? '1.5px solid #0284C7' : (isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'),
                  backgroundColor: isDark 
                    ? (applyToCards ? '#1E293B' : '#0B0F19') 
                    : (applyToCards ? '#F8FAFC' : '#FFFFFF'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#0284C7' : '#E0F2FE',
                      color: isDark ? '#FFFFFF' : '#0284C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        Thẻ nội dung chính
                      </span>
                      <code style={{ fontSize: '0.675rem', backgroundColor: isDark ? '#334155' : '#E2E8F0', padding: '1px 5px', borderRadius: '4px', color: isDark ? '#CBD5E1' : '#475569' }}>
                        .droplet-card
                      </code>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '1px' }}>
                      Khối dữ liệu, danh sách, bảng biểu, modal
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={applyToCards}
                  onChange={() => {}}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#0284C7',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Thẻ 2: Thanh đầu trang (Header) */}
              <div
                onClick={() => toggleTarget('applyToHeader')}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  border: applyToHeader ? '1.5px solid #0284C7' : (isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'),
                  backgroundColor: isDark 
                    ? (applyToHeader ? '#1E293B' : '#0B0F19') 
                    : (applyToHeader ? '#F8FAFC' : '#FFFFFF'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#065F46' : '#DCFCE7',
                      color: isDark ? '#A7F3D0' : '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <LayoutTemplate size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        Thanh đầu trang
                      </span>
                      <code style={{ fontSize: '0.675rem', backgroundColor: isDark ? '#334155' : '#E2E8F0', padding: '1px 5px', borderRadius: '4px', color: isDark ? '#CBD5E1' : '#475569' }}>
                        header
                      </code>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '1px' }}>
                      Thanh logo, bộ chọn năm/kỳ học và tiện ích
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={applyToHeader}
                  onChange={() => {}}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#0284C7',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Thẻ 3: Thanh menu bên (Sidebar) */}
              <div
                onClick={() => toggleTarget('applyToSidebar')}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  border: applyToSidebar ? '1.5px solid #0284C7' : (isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'),
                  backgroundColor: isDark 
                    ? (applyToSidebar ? '#1E293B' : '#0B0F19') 
                    : (applyToSidebar ? '#F8FAFC' : '#FFFFFF'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#78350F' : '#FEF3C7',
                      color: isDark ? '#FDE68A' : '#B45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MenuSquare size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        Thanh điều hướng bên
                      </span>
                      <code style={{ fontSize: '0.675rem', backgroundColor: isDark ? '#334155' : '#E2E8F0', padding: '1px 5px', borderRadius: '4px', color: isDark ? '#CBD5E1' : '#475569' }}>
                        .droplet-sidebar
                      </code>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '1px' }}>
                      Khối thanh menu các trang nghiệp vụ
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={applyToSidebar}
                  onChange={() => {}}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#0284C7',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Thẻ 4: Nút bấm & Nút tròn (.droplet-pill, .droplet-circle) */}
              <div
                onClick={() => toggleTarget('applyToPills')}
                style={{
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  border: applyToPills ? '1.5px solid #0284C7' : (isDark ? '1px solid #1E293B' : '1px solid #E2E8F0'),
                  backgroundColor: isDark 
                    ? (applyToPills ? '#1E293B' : '#0B0F19') 
                    : (applyToPills ? '#F8FAFC' : '#FFFFFF'),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#581C87' : '#F3E8FF',
                      color: isDark ? '#E9D5FF' : '#7E22CE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Sliders size={16} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        Nút bo tròn & Nút icon
                      </span>
                      <code style={{ fontSize: '0.675rem', backgroundColor: isDark ? '#334155' : '#E2E8F0', padding: '1px 5px', borderRadius: '4px', color: isDark ? '#CBD5E1' : '#475569' }}>
                        .droplet-pill
                      </code>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '1px' }}>
                      Nút bấm dạng giọt nước và nút icon tròn
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={applyToPills}
                  onChange={() => {}}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#0284C7',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── PHẦN 3: XEM TRƯỚC MẪU THẺ (LIVE PREVIEW) ── */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.55rem' }}>
              3. Mẫu thẻ xem trước
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: '16px',
                border: isDark && applyToCards ? '1px solid #334155' : '1px solid #E2E8F0',
                background: isDark && applyToCards 
                  ? 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)' 
                  : 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
                color: isDark && applyToCards ? '#F8FAFC' : '#0F172A',
                boxShadow: isDark && applyToCards 
                  ? '0 8px 24px rgba(0,0,0,0.45)' 
                  : '0 8px 20px rgba(15,23,42,0.06)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: isDark && applyToCards ? '#334155' : '#E0F2FE',
                    color: isDark && applyToCards ? '#38BDF8' : '#0369A1'
                  }}
                >
                  {isDark ? 'Đang bật Đen chữ trắng' : 'Đang bật Trắng chữ đen'}
                </span>
                <span style={{ fontSize: '0.675rem', color: isDark && applyToCards ? '#94A3B8' : '#64748B' }}>
                  Xem thử
                </span>
              </div>

              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem', color: isDark && applyToCards ? '#FFFFFF' : '#0F172A' }}>
                Mẫu thẻ component EduCenter
              </div>
              <p style={{ fontSize: '0.75rem', margin: '0 0 0.75rem', color: isDark && applyToCards ? '#CBD5E1' : '#475569', lineHeight: 1.4 }}>
                Nội dung thẻ và nền toàn trang được thể hiện sắc nét, tương phản tối ưu, bảo vệ mắt và giữ nguyên nét đẹp giọt nước.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF'
                  }}
                >
                  Xác nhận
                </span>
                <span
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    backgroundColor: isDark && applyToCards ? '#334155' : '#F1F5F9',
                    color: isDark && applyToCards ? '#F8FAFC' : '#475569'
                  }}
                >
                  Hủy bỏ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer của Drawer: Lưu trữ LocalStorage & Nút Khôi Phục ── */}
        <div
          style={{
            padding: '1rem 1.35rem',
            borderTop: isDark ? '1px solid #1E293B' : '1px solid #F1F5F9',
            backgroundColor: isDark ? '#0B0F19' : '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.725rem', color: isDark ? '#34D399' : '#059669', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            <span>Tự động lưu vào LocalStorage (giữ nguyên khi tải lại trang)</span>
          </div>

          <button
            type="button"
            onClick={resetToDefault}
            className="droplet-pill"
            style={{
              width: '100%',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: isDark ? '#F8FAFC' : '#475569',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              borderRadius: '10px'
            }}
          >
            <RotateCcw size={15} />
            <span>Khôi phục mặc định (Trắng chữ đen)</span>
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
};

export default DrawerCaiDatGiaoDien;
