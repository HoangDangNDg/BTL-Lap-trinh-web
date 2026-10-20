import React from 'react';
import { Building2, MapPin, Phone, Mail, Check, DoorClosed } from 'lucide-react';

/**
 * Component hiển thị thông tin Chi Nhánh (Tái sử dụng)
 * Tích hợp lớp Button vô hình (invisible overlay button) lấp đầy 100% diện tích bề mặt
 * để bắt sự kiện click và kích hoạt gọi API thời khóa biểu / chọn chi nhánh.
 */
const TheChiNhanh = ({
  chiNhanh,
  isSelected = false,
  onSelect,
  soPhong = null,
  showContact = true,
  style = {}
}) => {
  if (!chiNhanh) return null;

  return (
    <div
      className={`droplet-card the-chi-nhanh-card ${isSelected ? 'the-chi-nhanh-selected' : ''}`}
      style={{
        position: 'relative',
        padding: '1.25rem 1.35rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.85rem',
        borderRadius: '22px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
        border: isSelected ? '2px solid #0095F6' : '1px solid #E2E8F0',
        backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
        boxShadow: isSelected 
          ? '0 10px 25px -4px rgba(0, 149, 246, 0.22), 0 4px 10px -2px rgba(0, 149, 246, 0.12)' 
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transform: isSelected ? 'translateY(-2px)' : 'none',
        overflow: 'hidden',
        userSelect: 'none',
        ...style
      }}
    >
      {/* ── 1. LỚP BUTTON KHÔNG GIAO DIỆN LẤP ĐẦY 100% DIỆN TÍCH THẺ ── */}
      <button
        type="button"
        onClick={() => onSelect && onSelect(chiNhanh)}
        aria-label={`Chọn chi nhánh ${chiNhanh.tenCn}`}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          zIndex: 10,
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          padding: 0,
          margin: 0,
          borderRadius: 'inherit'
        }}
        title={`Bấm để tải thời khóa biểu & phòng học của ${chiNhanh.tenCn}`}
      />

      {/* ── 2. NỘI DUNG HIỂN THỊ TÁI SỬ DỤNG CỦA THẺ CHI NHÁNH ── */}
      <div style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
        {/* Hàng trên: Biểu tượng tròn & Huy hiệu cơ sở */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div 
            className="droplet-circle"
            style={{
              width: '46px',
              height: '46px',
              backgroundColor: isSelected ? '#E0F2FE' : '#ECFDF5',
              color: isSelected ? '#0284C7' : '#10B981',
              border: isSelected ? '1px solid #BAE6FD' : '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              flexShrink: 0
            }}
          >
            <Building2 size={24} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {isSelected && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: '#0095F6',
                color: '#FFFFFF',
                fontSize: '0.725rem',
                fontWeight: '800',
                padding: '0.25rem 0.6rem',
                borderRadius: '9999px',
                boxShadow: '0 1px 3px rgba(0, 149, 246, 0.4)'
              }}>
                <Check size={12} strokeWidth={3} />
                <span>Đang chọn</span>
              </span>
            )}
            <span 
              className="badge badge-info"
              style={{
                padding: '0.25rem 0.65rem',
                fontWeight: '700',
                fontSize: '0.75rem',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                borderRadius: '8px'
              }}
            >
              Chi nhánh hoạt động
            </span>
          </div>
        </div>

        {/* Thông tin tên & địa chỉ cơ sở */}
        <div style={{ marginTop: '0.9rem' }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.15rem',
            fontWeight: '800',
            color: isSelected ? '#0369A1' : '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.3
          }}>
            {chiNhanh.tenCn}
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.4rem',
            marginTop: '0.45rem',
            color: '#64748B',
            fontSize: '0.825rem',
            lineHeight: 1.35
          }}>
            <MapPin size={15} style={{ color: '#0284C7', flexShrink: 0, marginTop: '2px' }} />
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {chiNhanh.diaChi || 'Cơ sở đào tạo chuẩn trung tâm'}
            </span>
          </div>
        </div>

        {/* Số điện thoại / Email / Số phòng */}
        {showContact && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '0.75rem',
            fontSize: '0.775rem',
            color: '#475569'
          }}>
            {chiNhanh.sdt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={13} style={{ color: '#10B981' }} />
                <span style={{ fontWeight: '600' }}>{chiNhanh.sdt}</span>
              </div>
            )}
            {soPhong !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0284C7', fontWeight: '600' }}>
                <DoorClosed size={13} />
                <span>{soPhong} phòng học</span>
              </div>
            )}
            {!chiNhanh.sdt && chiNhanh.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} style={{ color: '#0284C7' }} />
                <span>{chiNhanh.email}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TheChiNhanh;


